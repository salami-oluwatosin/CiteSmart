import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { getMe } from "../api/endpoints";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setToken: (token: string | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "citesmart_token";

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  setToken: () => {},
  refreshUser: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(t);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await getMe();
      setUser(u);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [setToken]);

  useEffect(() => {
    refreshUser();
  }, [token, refreshUser]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, setToken, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
