import { useState, useRef, useEffect } from "react";
import type { Citation, ExportStyle } from "../types";
import { formatCitation } from "../utils/formatters";
import type { Bibliography } from "../types";

interface CitationCardProps {
  citation: Citation;
  style: ExportStyle;
  bibliographies: Bibliography[];
  currentBibId: number;
  onDelete: (id: number) => void;
  onMove: (citationId: number, targetBibId: number) => void;
  onCopy: (citationId: number, targetBibId: number) => void;
}

export default function CitationCard({
  citation,
  style,
  bibliographies,
  currentBibId,
  onDelete,
  onMove,
  onCopy,
}: CitationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [action, setAction] = useState<"move" | "copy" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setAction(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const otherBibs = bibliographies.filter((b) => b.id !== currentBibId);
  const formatted = formatCitation(citation, style);
  const shortRef =
    (citation.authors.length ? citation.authors[0].split(",")[0] : "Unknown") +
    (citation.year ? `, ${citation.year}` : "");

  return (
    <div className="group relative border border-gray-100 rounded-lg p-3 hover:border-gray-300 transition-colors bg-white">
      {/* Top line: author-year + delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-700 truncate">
            {shortRef}
          </p>
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {citation.title}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Context menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setAction(null);
              }}
              className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer text-xs"
              title="More actions"
            >
              ⋯
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                {!action && (
                  <>
                    <button
                      onClick={() => setAction("move")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Move to…
                    </button>
                    <button
                      onClick={() => setAction("copy")}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Copy to…
                    </button>
                  </>
                )}
                {action && (
                  <>
                    <div className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase">
                      {action === "move" ? "Move to" : "Copy to"}
                    </div>
                    {otherBibs.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        No other bibliographies
                      </div>
                    )}
                    {otherBibs.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          if (action === "move") onMove(citation.id, b.id);
                          else onCopy(citation.id, b.id);
                          setMenuOpen(false);
                          setAction(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 truncate cursor-pointer"
                      >
                        {b.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setAction(null)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(citation.id)}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer text-xs"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Formatted preview */}
      <div className="mt-2 p-2 rounded bg-gray-50 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono">
        {formatted}
      </div>
    </div>
  );
}
