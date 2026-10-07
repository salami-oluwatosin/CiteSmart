import type { Citation } from "../types";

/* ── Mirrors citesmart-backend/formatters.py exactly ── */

function authorsApa(authors: string[]): string {
  if (!authors.length) return "";
  if (authors.length === 1) return authors[0];
  if (authors.length <= 20)
    return authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1];
  return authors.slice(0, 19).join(", ") + ", ... " + authors[authors.length - 1];
}

export function formatApa(c: Citation): string {
  const authors = authorsApa(c.authors);
  const year = c.year ?? "n.d.";
  const title = c.title ?? "";
  const venue = c.venue ?? "";
  const tail = c.doi
    ? `https://doi.org/${c.doi}`
    : c.url ?? "";
  return `${authors} (${year}). ${title}. ${venue}. ${tail}`.trim();
}

export function formatMla(c: Citation): string {
  const authors = c.authors;
  let a: string;
  if (authors.length === 1) {
    a = authors[0];
  } else if (authors.length === 2) {
    a = `${authors[0]}, and ${authors[1]}`;
  } else {
    a = `${authors[0]}, et al.`;
  }
  const title = c.title ?? "";
  const venue = c.venue ?? "";
  const year = c.year ?? "n.d.";
  return `${a}. "${title}." ${venue}, ${year}.`;
}

export function formatChicago(c: Citation): string {
  let a = c.authors.length ? c.authors[0] : "";
  if (c.authors.length > 1) a += ", et al.";
  const title = c.title ?? "";
  const venue = c.venue ?? "";
  const year = c.year ?? "n.d.";
  return `${a}. "${title}." ${venue} (${year}).`;
}

export function formatBibtex(c: Citation): string {
  const key =
    (c.authors.length ? c.authors[0].split(",")[0] : "anon").toLowerCase() +
    (c.year ?? "");
  const authors = c.authors.join(" and ");
  const lines = [
    `@article{${key},`,
    `  title = {${c.title ?? ""}},`,
    `  author = {${authors}},`,
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
