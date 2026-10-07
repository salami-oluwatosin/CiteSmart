import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { login, loginWithGoogle } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast("Google login failed.", "error");
      return;
    }
    setLoading(true);
    try {
      const tokenRes = await loginWithGoogle(credentialResponse.credential);
      setToken(tokenRes.access_token);
      toast("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Google sign in failed.";
      toast(typeof msg === "string" ? msg : "Google sign in failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const tokenRes = await login(email, password);
      setToken(tokenRes.access_token);
      toast("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Invalid email or password.";
      toast(typeof msg === "string" ? msg : "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f3ed] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary">
              <span className="font-serif text-lg font-bold text-white">c.</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#26332b]">CiteSmart</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-[#e1e5dd] bg-[#fffefa] p-7 shadow-[0_18px_54px_rgba(45,58,47,.08)] sm:p-9">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.14em] text-[#758279]">Your research, together</p><h1 className="font-serif text-3xl text-[#26332b] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Log in to manage your bibliographies.
          </p>

          {/* Google Sign-in */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast("Google sign in failed", "error")}
                shape="pill"
                theme="outline"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>
            <div className="my-5 flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-[#e0e4dc]" />
              <span className="text-xs uppercase tracking-wider text-[#829087]">or with email</span>
              <div className="h-px flex-1 bg-[#e0e4dc]" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-[#405148]">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="w-full rounded-xl border border-[#dfe4dc] bg-white px-4 py-3 text-base transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-[#405148]">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-[#dfe4dc] bg-white px-4 py-3 text-base transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in…
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
