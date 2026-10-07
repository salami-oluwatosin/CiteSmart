def _authors_apa(authors: list[str]) -> str:
    if not authors:
        return ""
    if len(authors) == 1:
        return authors[0]
    if len(authors) <= 20:
        return ", ".join(authors[:-1]) + ", & " + authors[-1]
    return ", ".join(authors[:19]) + ", ... " + authors[-1]


def format_apa(c: dict) -> str:
    authors = _authors_apa(c["authors"])
    year = c.get("year") or "n.d."
    title = c.get("title", "")
    venue = c.get("venue") or ""
    doi = c.get("doi")
    url = c.get("url")
    tail = f"https://doi.org/{doi}" if doi else (url or "")
    return f"{authors} ({year}). {title}. {venue}. {tail}".strip()


def format_mla(c: dict) -> str:
    authors = c["authors"]
    if len(authors) == 1:
        a = authors[0]
    elif len(authors) == 2:
        a = f"{authors[0]}, and {authors[1]}"
    else:
        a = f"{authors[0]}, et al."
    title = c.get("title", "")
    venue = c.get("venue") or ""
    year = c.get("year") or "n.d."
    return f'{a}. "{title}." {venue}, {year}.'


def format_chicago(c: dict) -> str:
    authors = c["authors"]
    a = authors[0] if authors else ""
    if len(authors) > 1:
        a += ", et al."
    title = c.get("title", "")
    venue = c.get("venue") or ""
    year = c.get("year") or "n.d."
    return f'{a}. "{title}." {venue} ({year}).'


def format_bibtex(c: dict) -> str:
    key = (c["authors"][0].split(",")[0] if c["authors"] else "anon").lower()
    key += str(c.get("year") or "")
    authors = " and ".join(c["authors"])
    lines = [
        f"@article{{{key},",
        f"  title = {{{c.get('title','')}}},",
        f"  author = {{{authors}}},",
        f"  year = {{{c.get('year','')}}},",
    ]
    if c.get("venue"):
        lines.append(f"  journal = {{{c['venue']}}},")
    if c.get("doi"):
        lines.append(f"  doi = {{{c['doi']}}},")
    if c.get("url"):
        lines.append(f"  url = {{{c['url']}}},")
    lines.append("}")
    return "\n".join(lines)


FORMATTERS = {
    "apa": format_apa,
    "mla": format_mla,
    "chicago": format_chicago,
    "bibtex": format_bibtex,
}


def format_all(citations: list[dict], style: str) -> str:
    fmt = FORMATTERS.get(style, format_apa)
    if style == "bibtex":
        return "\n\n".join(fmt(c) for c in citations)
    # numbered list for academic styles
    return "\n\n".join(f"[{i+1}] {fmt(c)}" for i, c in enumerate(citations))