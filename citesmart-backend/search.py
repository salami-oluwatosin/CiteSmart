import re
import httpx
import xml.etree.ElementTree as ET
from dotenv import load_dotenv
import os

load_dotenv()

CROSSREF = "https://api.crossref.org"
ARXIV = "http://export.arxiv.org/api/query"
S2 = "https://api.semanticscholar.org/graph/v1"

POLITE_EMAIL = os.getenv("EMAIL_ADDRESS")


def detect_input_type(query: str) -> str:
    q = query.strip()
    if re.match(r"^10\.\d{4,}/", q):
        return "doi"
    if re.match(r"^(arXiv:)?\d{4}\.\d{4,5}(v\d+)?$", q) or re.match(r"^(arXiv:)?[a-z-]+/\d{7}$", q):
        return "arxiv"
    return "title"


# NORMALIZERS

def _normalize_crossref(item: dict) -> dict:
    authors = []
    for a in item.get("author", []):
        family = a.get("family", "")
        given = a.get("given", "")
        if family:
            initials = "".join(p[0] + "." for p in given.split() if p) if given else ""
            authors.append(f"{family}, {initials}".strip(", "))

    year = None
    for key in ("published", "issued", "published-print", "published-online"):
        dp = item.get(key, {}).get("date-parts")
        if dp and dp[0]:
            year = dp[0][0]
            break

    venue = None
    if item.get("container-title"):
        venue = item["container-title"][0]
    elif item.get("publisher"):
        venue = item["publisher"]

    title = item.get("title", [""])
    return {
        "title": title[0] if title else "",
        "authors": authors,
        "year": year,
        "venue": venue,
        "doi": item.get("DOI"),
        "url": item.get("URL"),
        "source": "crossref",
        "citation_count": item.get("is-referenced-by-count"),
    }


def _parse_arxiv_xml(xml_text: str) -> list[dict]:
    ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    root = ET.fromstring(xml_text)
    out = []
    for entry in root.findall("atom:entry", ns):
        t = entry.find("atom:title", ns)
        title = " ".join(t.text.split()) if t is not None and t.text else ""

        authors = []
        for a in entry.findall("atom:author", ns):
            n = a.find("atom:name", ns)
            if n is not None and n.text:
                authors.append(n.text.strip())

        pub = entry.find("atom:published", ns)
        year = int(pub.text[:4]) if pub is not None and pub.text else None

        aid = entry.find("atom:id", ns)
        arxiv_id = aid.text.split("/abs/")[-1] if aid is not None else None

        doi_elem = entry.find("arxiv:doi", ns)
        doi = doi_elem.text if doi_elem is not None else None

        out.append({
            "title": title,
            "authors": authors,
            "year": year,
            "venue": "arXiv",
            "doi": doi,
            "url": f"https://arxiv.org/abs/{arxiv_id}" if arxiv_id else None,
            "source": "arxiv",
        })
    return out


def _normalize_s2(item: dict) -> dict:
    ext = item.get("externalIds") or {}
    return {
        "title": item.get("title", ""),
        "authors": [a.get("name", "") for a in item.get("authors", [])],
        "year": item.get("year"),
        "venue": item.get("venue"),
        "doi": ext.get("DOI"),
        "url": f"https://www.semanticscholar.org/paper/{item.get('paperId')}" if item.get("paperId") else None,
        "source": "semanticscholar",
        "citation_count": item.get("citationCount"),
    }


# PROVIDERS

async def _fetch_doi(doi: str) -> dict | None:
    async with httpx.AsyncClient() as c:
        r = await c.get(f"{CROSSREF}/works/{doi}", params={"mailto": POLITE_EMAIL}, timeout=15)
        if r.status_code != 200:
            return None
        return _normalize_crossref(r.json()["message"])


async def _fetch_arxiv_id(arxiv_id: str) -> dict | None:
    clean = arxiv_id.replace("arXiv:", "")
    async with httpx.AsyncClient() as c:
        r = await c.get(ARXIV, params={"id_list": clean, "max_results": 1}, timeout=15)
        if r.status_code != 200:
            return None
        results = _parse_arxiv_xml(r.text)
        return results[0] if results else None


async def _search_crossref(query: str, rows: int = 10) -> list[dict]:
    async with httpx.AsyncClient() as c:
        r = await c.get(
            f"{CROSSREF}/works",
            params={"query": query, "rows": rows, "mailto": POLITE_EMAIL},
            timeout=15,
        )
        if r.status_code != 200:
            return []
        return [_normalize_crossref(i) for i in r.json()["message"]["items"]]


async def _search_arxiv(query: str, max_results: int = 10) -> list[dict]:
    async with httpx.AsyncClient() as c:
        r = await c.get(
            ARXIV,
            params={"search_query": f'ti:"{query}"', "max_results": max_results},
            timeout=15,
        )
        if r.status_code != 200:
            return []
        return _parse_arxiv_xml(r.text)


async def _search_s2(query: str, limit: int = 10) -> list[dict]:
    try:
        async with httpx.AsyncClient() as c:
            r = await c.get(
                f"{S2}/paper/search",
                params={
                    "query": query,
                    "fields": "title,authors,year,venue,externalIds,citationCount,paperId",
                    "limit": limit,
                },
                timeout=10,
            )
            if r.status_code != 200:
                return []
            return [_normalize_s2(i) for i in r.json().get("data", [])]
    except Exception:
        return []


# MAIN SEARCH

async def search(query: str, mode: str = "auto") -> list[dict]:
    query = query.strip()
    if not query:
        return []

    if mode == "auto":
        mode = detect_input_type(query)

    if mode == "doi":
        r = await _fetch_doi(query)
        return [r] if r else []

    if mode == "arxiv":
        r = await _fetch_arxiv_id(query)
        return [r] if r else []

    # title search — crossref + s2, deduped by DOI
    cr, s2 = await _search_crossref(query), await _search_s2(query)
    merged, seen = [], set()
    for item in cr + s2:
        doi = item.get("doi")
        if doi and doi in seen:
            continue
        if doi:
            seen.add(doi)
        merged.append(item)
    return merged[:20]