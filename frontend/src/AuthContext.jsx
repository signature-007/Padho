import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "./api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("lms_token"));

  const logout = useCallback(() => {
    localStorage.removeItem("lms_token");
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("lms_token")) return;
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem("lms_token"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener("lms:unauthorized", logout);
    return () => window.removeEventListener("lms:unauthorized", logout);
  }, [logout]);

  const authenticate = async (path, body) => {
    const data = await api(path, { method: "POST", body });
    localStorage.setItem("lms_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    loading,
    login: (email, password) =>
      authenticate("/auth/login", { email, password }),
    register: (name, email, password) =>
      authenticate("/auth/register", { name, email, password }),
    logout,
    setUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
