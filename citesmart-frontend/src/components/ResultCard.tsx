import { useState } from "react";
import type { SearchResult } from "../types";

interface ResultCardProps {
  result: SearchResult;
  isAdded: boolean;
  onAdd: () => void;
  adding: boolean;
}

export default function ResultCard({
  result,
  isAdded,
  onAdd,
  adding,
}: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="animate-slide-up rounded-xl border border-[#e4e8e1] bg-white p-4 transition-shadow hover:shadow-[0_8px_24px_rgba(45,58,47,.07)]">
      {/* Title */}
      <h3 className="font-semibold leading-snug text-[#29372f]">
        {result.title}
      </h3>

      {/* Authors + year */}
      <p className="mt-1 text-sm leading-6 text-[#6f7b72]">
        {result.authors.join(", ")}
        {result.year && <span className="ml-1">· {result.year}</span>}
      </p>

      {/* Venue + source badge + citation count */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {result.venue && (
          <span className="text-xs text-gray-400 italic">{result.venue}</span>
        )}
        {result.source && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-primary border border-blue-100">
            {result.source}
          </span>
        )}
        {result.citation_count != null && result.citation_count > 0 && (
          <span className="text-xs text-gray-400">
            {result.citation_count.toLocaleString()} citations
          </span>
        )}
      </div>

      {/* Expanded metadata */}
      {expanded && (
        <div className="mt-3 space-y-1 border-t border-[#eceee8] pt-3 text-xs leading-5 text-[#69766d]">
          {result.doi && (
            <p>
              <span className="font-medium text-gray-600">DOI:</span>{" "}
              <a
                href={`https://doi.org/${result.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {result.doi}
              </a>
            </p>
          )}
          {result.url && (
            <p>
              <span className="font-medium text-gray-600">URL:</span>{" "}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {result.url}
              </a>
            </p>
          )}
          <p>
            <span className="font-medium text-gray-600">Authors:</span>{" "}
            {result.authors.join("; ")}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onAdd}
          disabled={isAdded || adding}
          className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            isAdded
              ? "border border-[#d7e7dc] bg-[#edf5ef] text-[#32634b] cursor-default"
              : "bg-primary text-white hover:bg-primary-dark"
          } disabled:opacity-60`}
        >
          {adding ? (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding…
            </span>
          ) : isAdded ? (
            "✓ Added"
          ) : (
            "+ Add"
          )}
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide source details" : "Show source details"}
          className="cursor-pointer rounded-lg px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100"
          title={expanded ? "Collapse" : "Expand metadata"}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>
    </article>
  );
}
