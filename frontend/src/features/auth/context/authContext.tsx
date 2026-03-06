import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { fetchCurrentUser } from "../../../lib/api";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (t: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser()
    .then((user) => {
      setUser(user);
    })
    .catch(() => {
      logout();
    })
    .finally(() => {
      setLoading(false);
    });
  }, [token]);

  const login = async (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
    const user = await fetchCurrentUser();
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};