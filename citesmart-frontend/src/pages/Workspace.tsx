import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SearchPane from "../components/SearchPane";
import BibliographyPane from "../components/BibliographyPane";
import {
  getCitations,
  deleteCitation,
  moveCitation,
  copyCitation,
  getBibliographies,
} from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import type { Citation, Bibliography } from "../types";

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const bibId = Number(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [citations, setCitations] = useState<Citation[]>([]);
  const [bibliographies, setBibliographies] = useState<Bibliography[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [cits, bibs] = await Promise.all([
        getCitations(bibId),
        getBibliographies(),
      ]);
      setCitations(cits);
      setBibliographies(bibs);
    } catch {
      toast("Failed to load workspace", "error");
    } finally {
      setLoading(false);
    }
  }, [bibId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCitationAdded = (c: Citation) => {
    setCitations((prev) => [...prev, c]);
  };

  const handleDelete = async (citId: number) => {
    try {
      await deleteCitation(citId);
      setCitations((prev) => prev.filter((c) => c.id !== citId));
      toast("Citation removed");
    } catch {
      toast("Failed to delete citation", "error");
    }
  };

  const handleMove = async (citationId: number, targetBibId: number) => {
    try {
      await moveCitation(citationId, targetBibId);
      setCitations((prev) => prev.filter((c) => c.id !== citationId));
      toast("Citation moved");
    } catch {
      toast("Failed to move citation", "error");
    }
  };

  const handleCopy = async (citationId: number, targetBibId: number) => {
    try {
      await copyCitation(citationId, targetBibId);
      toast("Citation copied");
    } catch {
      toast("Failed to copy citation", "error");
    }
  };

  const currentBib = bibliographies.find((b) => b.id === bibId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2]">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#f7f7f2]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        {/* Top bar */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer rounded-full border border-[#e0e4dc] px-4 py-2 text-sm font-medium text-[#65736a] transition-colors hover:bg-white"
          >
            ← Back
          </button>
          <h1 className="truncate font-serif text-2xl text-[#26332b] sm:text-3xl">
            {currentBib?.name ?? "Bibliography"}
          </h1>
        </div>

        {/* Two-pane layout */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
          {/* LEFT — Search (60%) */}
          <div className="w-full lg:w-[58%]">
            <div className="min-h-[36rem] rounded-2xl border border-[#e4e7df] bg-[#fffefa] p-5 sm:p-6 lg:min-h-[calc(100vh-12rem)]">
              <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#7c897f]">Discover</p><h2 className="mt-1 font-serif text-2xl text-[#26332b]">Find a source</h2><p className="mt-1 text-sm text-[#7a867d]">Search by title, DOI, or arXiv identifier.</p></div>
              <SearchPane
                bibliographyId={bibId}
                citations={citations}
                onCitationAdded={handleCitationAdded}
              />
            </div>
          </div>

          {/* RIGHT — Bibliography (40%) */}
          <div className="w-full lg:w-[42%]">
            <div className="flex flex-col overflow-hidden rounded-2xl border border-[#e4e7df] bg-[#fffefa] p-5 sm:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]">
              <BibliographyPane
                bibliographyId={bibId}
                citations={citations}
                bibliographies={bibliographies}
                onDelete={handleDelete}
                onMove={handleMove}
                onCopy={handleCopy}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
