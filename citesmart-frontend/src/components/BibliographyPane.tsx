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
      <div className="mb-4 flex items-end justify-between border-b border-[#eceee8] pb-4"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#7c897f]">Your sources</p><h2 className="mt-1 font-serif text-2xl text-[#26332b]">Bibliography</h2></div><span className="rounded-full bg-[#edf2ec] px-3 py-1.5 text-xs font-semibold text-[#477560]" aria-label={`${citations.length} citations`}>{citations.length}</span></div>

      {/* Citations list */}
      <div className="mb-4 flex-1 space-y-2 overflow-y-auto pr-1" aria-live="polite">
        {citations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e0e5dc] bg-[#fafbf7] px-4 py-12 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#edf2ec] font-serif text-lg text-[#477560]" aria-hidden="true">
              Aa
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#78857c]">
              Your list is ready. Search for a source and add it here when you find it.
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
      <div className="flex items-center gap-2 border-t border-[#e7eae3] pt-4">
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as ExportStyle)}
          aria-label="Citation style"
          className="flex-1 cursor-pointer rounded-xl border border-[#dfe4dc] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="apa">APA</option>
          <option value="mla">MLA</option>
          <option value="chicago">Chicago</option>
          <option value="bibtex">BibTeX</option>
        </select>
        <button
          onClick={handleExport}
          disabled={exporting || citations.length === 0}
          className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
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
