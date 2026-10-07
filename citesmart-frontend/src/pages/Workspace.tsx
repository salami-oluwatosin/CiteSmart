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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {currentBib?.name ?? "Bibliography"}
          </h1>
        </div>

        {/* Two-pane layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT — Search (60%) */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 min-h-[calc(100vh-12rem)]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Search Papers
              </h2>
              <SearchPane
                bibliographyId={bibId}
                citations={citations}
                onCitationAdded={handleCitationAdded}
              />
            </div>
          </div>

          {/* RIGHT — Bibliography (40%) */}
          <div className="w-full lg:w-2/5">
            <div className="lg:sticky lg:top-20 bg-white border border-gray-200 rounded-xl p-5 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
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
