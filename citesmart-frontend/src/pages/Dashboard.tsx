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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Your Bibliographies
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              No bibliographies yet
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Create one to get started organizing your citations.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
            >
              + Create Bibliography
            </button>
          </div>
        )}

        {/* Bibliography cards */}
        {!loading && bibliographies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bibliographies.map((bib, i) => (
              <div
                key={bib.id}
                className="animate-slide-up border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <h3 className="font-semibold text-gray-900 truncate">
                  {bib.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Created {formatDate(bib.created_at)}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/bibliography/${bib.id}`)}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(bib.id)}
                    className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
