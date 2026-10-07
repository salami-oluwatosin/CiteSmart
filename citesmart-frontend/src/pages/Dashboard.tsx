import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import {
  getBibliographies,
  createBibliography,
  deleteBibliography,
} from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import type { Bibliography } from "../types";

export default function Dashboard() {
  const [bibliographies, setBibliographies] = useState<Bibliography[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const hasAutoCreated = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchBibs = useCallback(async () => {
    try {
      const data = await getBibliographies();
      setBibliographies(data);
      return data;
    } catch {
      toast("Failed to load bibliographies", "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    (async () => {
      const bibs = await fetchBibs();
      // Auto-create first bibliography for new users
      if (bibs.length === 0 && !hasAutoCreated.current) {
        hasAutoCreated.current = true;
        try {
          await createBibliography("My First Bibliography");
          await fetchBibs();
          toast("We created your first bibliography!");
        } catch {
          // Ignore — user can create manually
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createBibliography(newName.trim());
      await fetchBibs();
      setModalOpen(false);
      setNewName("");
      toast("Bibliography created!");
    } catch {
      toast("Failed to create bibliography", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBibliography(id);
      setBibliographies((prev) => prev.filter((b) => b.id !== id));
      toast("Bibliography deleted");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
      <div className="min-h-screen bg-[#f7f7f2]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        {/* Top bar */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.15em] text-[#758279]">Your research</p><h1 className="font-serif text-3xl tracking-tight text-[#26332b] sm:text-4xl">Bibliographies</h1><p className="mt-2 text-sm text-[#718077]">Keep every project’s sources together, from first search to final draft.</p></div>
          <button
            onClick={() => setModalOpen(true)}
            className="cursor-pointer rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            + New Bibliography
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-5 space-y-3"
              >
                <div className="skeleton h-5 w-2/3 rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-8 w-full rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && bibliographies.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#d9dfd6] bg-[#fbfbf8] px-6 py-24 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#edf2ec] font-serif text-2xl text-[#477560]" aria-hidden="true">
              Aa
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Start a bibliography
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Give a research project its own place for sources and citations.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="cursor-pointer rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              + Create Bibliography
            </button>
          </div>
        )}

        {/* Bibliography cards */}
        {!loading && bibliographies.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bibliographies.map((bib, i) => (
              <div
                key={bib.id}
                className="animate-slide-up rounded-2xl border border-[#e4e7df] bg-[#fffefa] p-6 transition-shadow hover:shadow-[0_14px_34px_rgba(45,58,47,.08)]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <h3 className="truncate font-serif text-xl text-[#26332b]">
                  {bib.name}
                </h3>
                <p className="mt-2 text-sm text-[#829087]">
                  Created {formatDate(bib.created_at)}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/bibliography/${bib.id}`)}
                    className="flex-1 cursor-pointer rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(bib.id)}
                    className="cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium text-[#758078] transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create modal */}
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setNewName("");
          }}
          title="New Bibliography"
        >
          <div className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Machine Learning Survey"
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setNewName("");
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
