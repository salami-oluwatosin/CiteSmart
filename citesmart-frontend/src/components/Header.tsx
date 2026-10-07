import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout as logoutApi } from "../api/endpoints";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutApi();
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e8e0] bg-[#fbfbf8]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8 lg:px-12">
        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="CiteSmart dashboard"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#24584b]">
            <span className="font-serif text-lg font-bold text-white">c.</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-[#26332b]">CiteSmart</span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-[#68756c] sm:inline">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="cursor-pointer rounded-full border border-[#e0e4dc] px-4 py-2 text-sm font-medium text-[#58665d] transition-colors hover:bg-[#f0f2ec]"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
