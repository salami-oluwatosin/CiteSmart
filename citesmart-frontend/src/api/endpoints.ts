import client from "./client";
import type {
  User,
  AuthTokenResponse,
  Bibliography,
  Citation,
  SearchResult,
  SearchMode,
  ExportStyle,
} from "../types";

const TOKEN_KEY = "citesmart_token";

/* ──────────── Auth ──────────── */

export async function signup(email: string, password: string): Promise<User> {
  const { data } = await client.post<User>("/auth/signup", { email, password });
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthTokenResponse> {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  const { data } = await client.post<AuthTokenResponse>(
    "/auth/login",
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export async function loginWithGoogle(
  credential: string
): Promise<AuthTokenResponse> {
  const { data } = await client.post<AuthTokenResponse>("/auth/google", {
    credential,
  });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<User>("/auth/me");
  return data;
}

/* ──────────── Bibliographies ──────────── */

export async function getBibliographies(): Promise<Bibliography[]> {
  const { data } = await client.get<Bibliography[]>("/bibliographies");
  return data;
}

export async function createBibliography(
  name: string
): Promise<Bibliography> {
  const { data } = await client.post<Bibliography>("/bibliographies", { name });
  return data;
}

export async function deleteBibliography(id: string): Promise<void> {
  await client.delete(`/bibliographies/${id}`);
}

/* ──────────── Citations ──────────── */

export async function getCitations(bibId: string): Promise<Citation[]> {
  const { data } = await client.get<Citation[]>(
    `/bibliographies/${bibId}/citations`
  );
  return data;
}

export async function createCitation(body: {
  bibliography_id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  url: string | null;
  source: string | null;
}): Promise<Citation> {
  const { data } = await client.post<Citation>("/citations", body);
  return data;
}

export async function deleteCitation(id: string): Promise<void> {
  await client.delete(`/citations/${id}`);
}

export async function moveCitation(
  citationId: string,
  targetBibId: string
): Promise<void> {
  await client.post(`/citations/${citationId}/move/${targetBibId}`);
}

export async function copyCitation(
  citationId: string,
  targetBibId: string
): Promise<void> {
  await client.post(`/citations/${citationId}/copy/${targetBibId}`);
}

/* ──────────── Search ──────────── */

export async function searchPapers(
  query: string,
  mode: SearchMode
): Promise<SearchResult[]> {
  const { data } = await client.post<{ results: SearchResult[] }>("/search", {
    query,
    mode,
  });
  return data.results;
}

/* ──────────── Export ──────────── */

export async function exportBibliography(
  bibliographyId: string,
  style: ExportStyle
): Promise<void> {
  const response = await client.post(
    "/export",
    { bibliography_id: bibliographyId, style },
    { responseType: "blob" }
  );

  // Extract filename from Content-Disposition or generate one
  const disposition = response.headers["content-disposition"];
  let filename = `bibliography.${style === "bibtex" ? "bib" : "txt"}`;
  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    if (match) filename = match[1];
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
