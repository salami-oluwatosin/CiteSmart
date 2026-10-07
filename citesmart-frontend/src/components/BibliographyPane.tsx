import { useState } from "react";
import type { Citation, ExportStyle, Bibliography } from "../types";
import { exportBibliography } from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import CitationCard from "./CitationCard";

interface BibliographyPaneProps {
  bibliographyId: number;
  citations: Citation[];
  bibliographies: Bibliography[];
  onDelete: (id: number) => void;
  onMove: (citationId: number, targetBibId: number) => void;
  onCopy: (citationId: number, targetBibId: number) => void;
}

export default function BibliographyPane({
  bibliographyId,
  citations,
  bibliographies,
  onDelete,
  onMove,
  onCopy,
}: BibliographyPaneProps) {
  const [style, setStyle] = useState<ExportStyle>("apa");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (citations.length === 0) {
      toast("No citations to export", "error");
      return;
    }
    setExporting(true);
    try {
      await exportBibliography(bibliographyId, style);
      toast("Bibliography exported!");
    } catch {
      toast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Bibliography{" "}
        <span className="text-gray-400 font-normal">({citations.length})</span>
      </h2>

      {/* Citations list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
        {citations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-xl">📚</span>
            </div>
            <p className="text-sm text-gray-400">
              No citations yet. Search and add papers from the left.
            </p>
          </div>
        )}

        {citations.map((c) => (
          <CitationCard
            key={c.id}
            citation={c}
            style={style}
            bibliographies={bibliographies}
            currentBibId={bibliographyId}
            onDelete={onDelete}
            onMove={onMove}
            onCopy={onCopy}
          />
        ))}
      </div>

      {/* Export bar */}
      <div className="border-t border-gray-200 pt-4 flex items-center gap-2">
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as ExportStyle)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="apa">APA</option>
          <option value="mla">MLA</option>
          <option value="chicago">Chicago</option>
          <option value="bibtex">BibTeX</option>
        </select>
        <button
          onClick={handleExport}
          disabled={exporting || citations.length === 0}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {exporting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Exporting
            </span>
          ) : (
            "Export"
          )}
        </button>
      </div>
    </div>
  );
}
