import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { signup, login, loginWithGoogle } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast("Google signup failed.", "error");
      return;
    }
    setLoading(true);
    try {
      const tokenRes = await loginWithGoogle(credentialResponse.credential);
      setToken(tokenRes.access_token);
      toast("Welcome to CiteSmart!");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Google sign up failed.";
      toast(typeof msg === "string" ? msg : "Google sign up failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signup(email, password);
      // Auto-login after signup
      const tokenRes = await login(email, password);
      setToken(tokenRes.access_token);
      toast("Account created! Welcome to CiteSmart.");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Signup failed. Please try again.";
      toast(typeof msg === "string" ? msg : "Signup failed.", "error");
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.14em] text-[#758279]">A clearer way to cite</p><h1 className="mb-1 font-serif text-3xl text-[#26332b]">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Start managing your citations for free.
          </p>

          {/* Google Sign-in */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast("Google signup failed", "error")}
                shape="pill"
                theme="outline"
                size="large"
                text="signup_with"
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
                minLength={6}
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
                  Creating account…
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
