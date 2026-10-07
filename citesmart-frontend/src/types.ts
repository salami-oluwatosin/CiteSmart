/* ---- TypeScript interfaces matching the backend schemas ---- */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface Bibliography {
  id: string;
  name: string;
  created_at: string;
}

export interface Citation {
  id: string;
  bibliography_id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  url: string | null;
  source: string | null;
  created_at: string;
}

export interface SearchResult {
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  url: string | null;
  source: string | null;
  citation_count: number | null;
}

export type SearchMode = "auto" | "doi" | "arxiv" | "title";
export type ExportStyle = "apa" | "mla" | "chicago" | "bibtex";
