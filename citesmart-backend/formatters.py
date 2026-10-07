def _authors_apa(authors: list[str]) -> str:
    if not authors:
        return ""
    if len(authors) == 1:
        return authors[0]
    if len(authors) <= 20:
        return ", ".join(authors[:-1]) + ", & " + authors[-1]
    return ", ".join(authors[:19]) + ", ... " + authors[-1]


def format_apa(c: dict) -> str:
    authors = _authors_apa(c.get("authors") or [])
    year = c.get("year") or "n.d."
    title = c.get("title") or ""
    venue = c.get("venue") or ""
    doi = c.get("doi")
    url = c.get("url")
    tail = f"https://doi.org/{doi}" if doi else (url or "")
    
    parts = []
    if authors:
        parts.append(f"{authors} ({year})")
    else:
        parts.append(f"({year})")
    if title:
        parts.append(title if title.endswith(".") else f"{title}.")
    if venue:
        parts.append(venue if venue.endswith(".") else f"{venue}.")
    if tail:
        parts.append(tail)
    return " ".join(parts).strip()


def format_mla(c: dict) -> str:
    authors = c.get("authors") or []
    if not authors:
        a = ""
    elif len(authors) == 1:
        a = authors[0]
    elif len(authors) == 2:
        a = f"{authors[0]}, and {authors[1]}"
    else:
        a = f"{authors[0]}, et al."
    
    title = c.get("title") or ""
    venue = c.get("venue") or ""
    year = c.get("year") or "n.d."
    
    res = []
    if a:
        res.append(f"{a}.")
    if title:
        res.append(f'"{title}."')
    if venue and year:
        res.append(f"{venue}, {year}.")
    elif venue:
        res.append(f"{venue}.")
    else:
        res.append(f"{year}.")
    return " ".join(res).strip()


def format_chicago(c: dict) -> str:
    authors = c.get("authors") or []
    a = authors[0] if authors else ""
    if len(authors) > 1:
        a += ", et al."
    title = c.get("title") or ""
    venue = c.get("venue") or ""
    year = c.get("year") or "n.d."
    
    res = []
    if a:
        res.append(f"{a}.")
    if title:
        res.append(f'"{title}."')
    if venue:
        res.append(f"{venue} ({year}).")
    else:
        res.append(f"({year}).")
    return " ".join(res).strip()


def format_bibtex(c: dict) -> str:
    authors = c.get("authors") or []
    key_author = "anon"
    if authors:
        first = authors[0].split(",")[0].strip()
        first_clean = "".join(ch for ch in first if ch.isalnum())
        if first_clean:
            key_author = first_clean.lower()
    key = f"{key_author}{c.get('year') or ''}"
    authors_str = " and ".join(authors) if authors else "Unknown"
    
    lines = [
        f"@article{{{key},",
        f"  title = {{{c.get('title') or ''}}},",
        f"  author = {{{authors_str}}},",
        f"  year = {{{c.get('year') or ''}}},",
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