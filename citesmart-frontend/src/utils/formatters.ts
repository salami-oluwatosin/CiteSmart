import type { Citation } from "../types";

/* ── Mirrors citesmart-backend/formatters.py exactly ── */

function authorsApa(authors: string[]): string {
  if (!authors || !authors.length) return "";
  if (authors.length === 1) return authors[0];
  if (authors.length <= 20)
    return authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1];
  return authors.slice(0, 19).join(", ") + ", ... " + authors[authors.length - 1];
}

export function formatApa(c: Citation): string {
  const authors = authorsApa(c.authors || []);
  const year = c.year ?? "n.d.";
  const title = c.title ?? "";
  const venue = c.venue ?? "";
  const tail = c.doi
    ? `https://doi.org/${c.doi}`
    : c.url ?? "";
  
  const parts = [];
  if (authors) {
    parts.push(`${authors} (${year})`);
  } else {
    parts.push(`(${year})`);
  }
  if (title) parts.push(title.endsWith(".") ? title : `${title}.`);
  if (venue) parts.push(venue.endsWith(".") ? venue : `${venue}.`);
  if (tail) parts.push(tail);
  return parts.join(" ").trim();
}

export function formatMla(c: Citation): string {
  const authors = c.authors || [];
  let a = "";
  if (authors.length === 1) {
    a = authors[0];
  } else if (authors.length === 2) {
    a = `${authors[0]}, and ${authors[1]}`;
  } else if (authors.length > 2) {
    a = `${authors[0]}, et al.`;
  }
  const title = c.title ?? "";
  const venue = c.venue ?? "";
  const year = c.year ?? "n.d.";
  
  const res = [];
  if (a) res.push(`${a}.`);
  if (title) res.push(`"${title}."`);
  if (venue && year) res.push(`${venue}, ${year}.`);
  else if (venue) res.push(`${venue}.`);
  else res.push(`${year}.`);
  return res.join(" ").trim();
}

export function formatChicago(c: Citation): string {
  const authors = c.authors || [];
  let a = authors.length ? authors[0] : "";
  if (authors.length > 1) a += ", et al.";
  const title = c.title ?? "";
  const venue = c.venue ?? "";
  const year = c.year ?? "n.d.";
  
  const res = [];
  if (a) res.push(`${a}.`);
  if (title) res.push(`"${title}."`);
  if (venue) res.push(`${venue} (${year}).`);
  else res.push(`(${year}).`);
  return res.join(" ").trim();
}

export function formatBibtex(c: Citation): string {
  const authors = c.authors || [];
  let keyAuthor = "anon";
  if (authors.length) {
    const first = authors[0].split(",")[0].trim().replace(/[^a-zA-Z0-9]/g, "");
    if (first) keyAuthor = first.toLowerCase();
  }
  const key = `${keyAuthor}${c.year ?? ""}`;
  const authorsStr = authors.length ? authors.join(" and ") : "Unknown";
  const lines = [
    `@article{${key},`,
    `  title = {${c.title ?? ""}},`,
    `  author = {${authorsStr}},`,
    `  year = {${c.year ?? ""}},`,
  ];
  if (c.venue) lines.push(`  journal = {${c.venue}},`);
  if (c.doi) lines.push(`  doi = {${c.doi}},`);
  if (c.url) lines.push(`  url = {${c.url}},`);
  lines.push("}");
  return lines.join("\n");
}

export type FormatFn = (c: Citation) => string;

export const FORMATTERS: Record<string, FormatFn> = {
  apa: formatApa,
  mla: formatMla,
  chicago: formatChicago,
  bibtex: formatBibtex,
};

export function formatCitation(c: Citation, style: string): string {
  return (FORMATTERS[style] ?? formatApa)(c);
}
