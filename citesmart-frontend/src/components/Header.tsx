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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Cite<span className="text-primary">Smart</span>
          </span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-500 hidden sm:inline">
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
