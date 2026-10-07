import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const currentYear = new Date().getFullYear();
const features = [
  { number: "01", title: "Find the sources that matter", body: "Search by title, DOI, or arXiv ID and bring trusted research into one considered workspace." },
  { number: "02", title: "Keep your reading in order", body: "Build bibliographies around a thesis, a chapter, a course, or the book you’re writing." },
  { number: "03", title: "Cite with confidence", body: "Preview and export your references in APA, MLA, Chicago, or BibTeX when you’re ready." },
];

export default function Landing() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && token) navigate("/dashboard", { replace: true }); }, [loading, token, navigate]);
  if (loading) return <div className="min-h-screen bg-[#f7f7f2]" aria-label="Loading" />;

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f2] text-[#202823]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3" aria-label="CiteSmart home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#24584b] text-lg font-semibold text-white">c.</span>
          <span className="text-lg font-semibold tracking-tight">CiteSmart</span>
        </a>
        <nav className="flex items-center gap-3" aria-label="Account">
          <button onClick={() => navigate("/login")} className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#42534a] hover:bg-[#e9ece5]">Log in</button>
          <button onClick={() => navigate("/signup")} className="rounded-full bg-[#24584b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173e35]">Create an account</button>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.08fr_.92fr] lg:px-12 lg:pb-28 lg:pt-24">
          <div className="absolute -right-24 top-0 -z-0 h-80 w-80 rounded-full bg-[#e6ede5] blur-3xl" aria-hidden="true" />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7e1d8] bg-white/70 px-3.5 py-2 text-xs font-semibold uppercase tracking-[.13em] text-[#42685a]"><span className="h-2 w-2 rounded-full bg-[#c98546]" /> A calmer way to manage your sources</p>
            <h1 className="font-serif text-5xl leading-[1.08] tracking-[-.045em] text-[#202823] sm:text-6xl lg:text-[4.6rem]">Good research<br className="hidden sm:block" /> begins with <em className="font-medium text-[#39725f]">good sources.</em></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#657168] sm:text-xl">Collect papers, shape your bibliographies, and prepare citations with a workspace that stays clear from first reading to final draft.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate("/signup")} className="rounded-full bg-[#24584b] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(36,88,75,.16)] transition hover:-translate-y-0.5 hover:bg-[#173e35]">Start your bibliography <span aria-hidden="true">→</span></button>
              <button onClick={() => navigate("/login")} className="rounded-full border border-[#d8ddd5] bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#405148] transition hover:bg-white">I already have an account</button>
            </div>
            <p className="mt-5 text-sm text-[#7a847d]">Free and open source · For students, scholars, and authors</p>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[540px] lg:ml-auto">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full border border-[#e1e4dc]" aria-hidden="true" />
            <div className="relative rounded-[2rem] border border-[#e3e5dd] bg-[#fffefa] p-5 shadow-[0_28px_80px_rgba(50,65,54,.12)] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#eceee8] pb-5"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#839087]">Your library</p><h2 className="mt-1 font-serif text-2xl">Climate &amp; cities</h2></div><span className="rounded-full bg-[#edf3ee] px-3 py-1.5 text-xs font-semibold text-[#39725f]">12 sources</span></div>
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#e4e8e1] bg-[#fafbf7] px-4 py-3 text-sm text-[#8a948b]"><span aria-hidden="true">⌕</span><span>Search papers, titles, or DOI</span><kbd className="ml-auto rounded border border-[#e2e5de] bg-white px-2 py-1 text-[10px]">⌘ K</kbd></div>
              <div className="mt-4 space-y-3">
                <article className="rounded-xl border border-[#e8eae4] p-4"><div className="flex items-start gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f2eee4] text-sm text-[#ae7845]">01</span><div className="min-w-0"><h3 className="font-semibold leading-6">The climate city: urban planning in a warming world</h3><p className="mt-1 text-sm text-[#7c877e]">H. Bulkeley, V. Castán Broto · 2023</p><p className="mt-2 text-xs italic text-[#839087]">Urban Studies Review</p></div></div></article>
                <article className="rounded-xl border border-[#e8eae4] p-4"><div className="flex items-start gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eaf0eb] text-sm text-[#477560]">02</span><div className="min-w-0"><h3 className="font-semibold leading-6">Resilient infrastructure and the public realm</h3><p className="mt-1 text-sm text-[#7c877e]">M. Anguelovski, J. Connolly · 2022</p><p className="mt-2 text-xs italic text-[#839087]">Journal of Urban Affairs</p></div></div></article>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#eceee8] pt-4"><span className="text-xs text-[#7c877e]">Ready to export</span><span className="rounded-full bg-[#24584b] px-4 py-2 text-xs font-semibold text-white">APA 7th edition</span></div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-[#e4e6df] bg-white px-4 py-3 shadow-lg sm:block"><p className="text-xs font-semibold text-[#42685a]">A little more organized</p><p className="mt-1 text-xs text-[#829087]">One source at a time.</p></div>
          </div>
        </section>

        <section className="border-y border-[#e7e9e2] bg-[#f1f2ec]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <div className="mb-10 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#718276]">A thoughtful research companion</p><h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">Less time formatting.<br className="hidden sm:block" /> More time thinking.</h2></div>
            <div className="grid gap-4 md:grid-cols-3">{features.map((feature) => <article key={feature.number} className="rounded-2xl border border-[#e2e5dd] bg-[#fbfbf8] p-6 sm:p-7"><p className="font-serif text-2xl text-[#b37b48]">{feature.number}</p><h3 className="mt-5 text-lg font-semibold">{feature.title}</h3><p className="mt-2 leading-7 text-[#6f7b72]">{feature.body}</p></article>)}</div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-[#818b82] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span>© {currentYear} CiteSmart</span><span>Made for careful reading and clear thinking.</span></footer>
    </div>
  );
}
