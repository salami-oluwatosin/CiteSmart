import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && token) navigate("/dashboard", { replace: true });
  }, [loading, token, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Cite<span className="text-primary">Smart</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Free & open-source
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Cite<span className="text-primary">Smart</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-500 leading-relaxed">
            Free citation manager for your final year project.
            <br className="hidden sm:block" />
            Search, save, and export your references in seconds.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Get started — it&apos;s free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Log in
            </button>
          </div>
        </div>

        {/* Feature strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 mb-16 max-w-4xl w-full">
          {[
            {
              icon: "🔍",
              title: "Search papers",
              desc: "Find papers by title, DOI, or arXiv ID across multiple academic databases.",
            },
            {
              icon: "📑",
              title: "Save to bibliography",
              desc: "Organize your references into named bibliographies. Move or copy between them.",
            },
            {
              icon: "📤",
              title: "Export citations",
              desc: "Download formatted citations in APA, MLA, Chicago, or BibTeX style.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg mb-3">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        © {new Date().getFullYear()} CiteSmart. Built for postgrad students.
      </footer>
    </div>
  );
}
