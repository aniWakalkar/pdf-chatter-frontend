import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, onUnauthorized, tokenStore } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    onUnauthorized(logout);
    if (!tokenStore.get()) return;
    api
      .me()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const handleAuth = useCallback((result) => {
    tokenStore.set(result.access_token);
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback((email, password) => api.login({ email, password }).then(handleAuth), [handleAuth]);

  const register = useCallback(
    (fullName, email, password) => api.register({ full_name: fullName, email, password }).then(handleAuth),
    [handleAuth],
  );

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
