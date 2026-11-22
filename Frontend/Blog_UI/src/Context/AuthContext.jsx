import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import Logo from "../Components/ui/Logo";

export const AuthContext = createContext(null);

const toCurrentUser = (user) =>
  user
    ? {
        userId: user.userId || user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
      }
    : null;

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setCurrentUser = useCallback((user) => setCurrentUserState(toCurrentUser(user)), []);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/auth/isLogin");
      setCurrentUser(res.data?.payload);
    } catch {
      setCurrentUser(null);
    }
  }, [setCurrentUser]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  /**
   * Resolves to { user } when signed in, or { mfaRequired, mfaToken, method } when a
   * second step is needed.
   */
  const login = useCallback(
    async (email, password) => {
      const res = await api.post("/auth/login", { email, password });
      if (res.data?.mfaRequired) {
        return {
          mfaRequired: true,
          mfaToken: res.data.mfaToken,
          method: res.data.method,
          message: res.data.message,
        };
      }
      setCurrentUser(res.data?.userInfo);
      return { user: res.data?.userInfo };
    },
    [setCurrentUser]
  );

  const completeMfa = useCallback(
    async (mfaToken, code) => {
      const res = await api.post("/auth/mfa/challenge", { mfaToken, code });
      setCurrentUser(res.data?.userInfo);
      return { user: res.data?.userInfo, recoveryCodesLeft: res.data?.recoveryCodesLeft };
    },
    [setCurrentUser]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setCurrentUser(null);
    }
  }, [setCurrentUser]);

  const updateCurrentUser = useCallback(
    (patch) => setCurrentUserState((previous) => (previous ? { ...previous, ...patch } : previous)),
    []
  );

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      updateCurrentUser,
      login,
      completeMfa,
      logout,
      refresh,
    }),
    [currentUser, setCurrentUser, updateCurrentUser, login, completeMfa, logout, refresh]
  );

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas dark:bg-canvas-dark">
        <Logo size="lg" />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-600" />
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
