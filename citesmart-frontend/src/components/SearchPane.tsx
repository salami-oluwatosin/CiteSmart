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
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers by title, DOI, or arXiv ID…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as SearchMode)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
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
          className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
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
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 space-y-2"
              >
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-4 w-1/4 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
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
      </div>
    </div>
  );
}
