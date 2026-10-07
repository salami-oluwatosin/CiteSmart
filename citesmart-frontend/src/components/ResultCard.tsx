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
    <div className="animate-slide-up border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      {/* Title */}
      <h3 className="font-semibold text-gray-900 leading-snug">
        {result.title}
      </h3>

      {/* Authors + year */}
      <p className="text-sm text-gray-500 mt-1">
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
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
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
              ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
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
          className="text-sm px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          title={expanded ? "Collapse" : "Expand metadata"}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>
    </div>
  );
}
