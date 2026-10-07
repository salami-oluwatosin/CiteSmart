import { useState, type FormEvent } from "react";
import type { SearchResult, SearchMode, Citation } from "../types";
import { searchPapers, createCitation } from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import ResultCard from "./ResultCard";

interface SearchPaneProps {
  bibliographyId: number;
  citations: Citation[];
  onCitationAdded: (c: Citation) => void;
}

export default function SearchPane({
  bibliographyId,
  citations,
  onCitationAdded,
}: SearchPaneProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("auto");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [addingDois, setAddingDois] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const addedDois = new Set(
    citations.filter((c) => c.doi).map((c) => c.doi as string)
  );

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchPapers(query.trim(), mode);
      setResults(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Search failed. Please try again.";
      toast(message, "error");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (result: SearchResult) => {
    const key = result.doi ?? result.title;
    setAddingDois((prev) => new Set(prev).add(key));
    try {
      const citation = await createCitation({
        bibliography_id: bibliographyId,
        title: result.title,
        authors: result.authors,
        year: result.year,
        venue: result.venue,
        doi: result.doi,
        url: result.url,
        source: result.source,
      });
      onCitationAdded(citation);
      toast("Citation added");
    } catch {
      toast("Failed to add citation", "error");
    } finally {
      setAddingDois((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <input
            aria-label="Search papers by title, DOI, or arXiv ID"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers by title, DOI, or arXiv ID…"
            className="min-w-0 flex-1 rounded-xl border border-[#dfe4dc] bg-white px-4 py-3 text-base transition-all placeholder:text-[#98a198] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            aria-label="Search type"
            value={mode}
            onChange={(e) => setMode(e.target.value as SearchMode)}
            className="cursor-pointer rounded-xl border border-[#dfe4dc] bg-white px-3 py-3 text-sm text-[#4e5b52] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="auto">Auto</option>
            <option value="doi">DOI</option>
            <option value="title">Title</option>
            <option value="arxiv">arXiv</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="cursor-pointer rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching
            </span>
          ) : (
            "Search"
          )}
        </button>
      </form>

      {/* Results */}
      <div className="min-h-[18rem] flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="space-y-3 rounded-xl border border-[#e6e9e2] p-4"
              >
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-4 w-1/4 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dfe4dc] bg-[#fafbf7] px-5 py-14 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#edf2ec] text-xl text-[#477560]" aria-hidden="true">
              ⌕
            </div>
            <p className="text-gray-500 text-sm">
              No match for &ldquo;{query}&rdquo;.
              <br />
              Try a DOI or check the spelling.
            </p>
          </div>
        )}

        {!loading &&
          results.map((r, i) => {
            const key = r.doi ?? r.title;
            return (
              <ResultCard
                key={`${key}-${i}`}
                result={r}
                isAdded={r.doi ? addedDois.has(r.doi) : false}
                adding={addingDois.has(key)}
                onAdd={() => handleAdd(r)}
              />
            );
          })}

        {!loading && !searched && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e0e5dc] bg-[#fafbf7] px-5 py-14 text-center">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#edf2ec] font-serif text-lg text-[#477560]" aria-hidden="true">Aa</div>
            <h3 className="font-semibold text-[#33433a]">Search your next source</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#78857c]">Enter a paper title, DOI, or arXiv ID. Your results will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
