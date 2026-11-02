import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Navigate } from "react-router-dom";

const KEY = "xcmg_auth";

/* Where each account type lands after a successful login */
export const ROLE_HOME = {
  dealer: "/service-ticket",
  oem: "/service-ticket",
  frontdesk: "/front-desk",
};

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/* Only these three details are saved on the device: name, email, account type */
const pick = (u) =>
  u ? { name: u.name, email: u.email, accountType: u.accountType } : null;

const read = () => {
  try {
    const user = pick(JSON.parse(localStorage.getItem(KEY))?.user);
    return user?.email ? { user } : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(read); // { user: { name, email, accountType } }

  const login = useCallback(({ user }) => {
    const saved = { user: pick(user) };
    localStorage.setItem(KEY, JSON.stringify(saved));
    setSession(saved);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, login, logout }),
    [session, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* Wrap a page: <RequireAuth roles={["dealer","oem"]}> ... </RequireAuth> */
export function RequireAuth({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.accountType))
    return <Navigate to={ROLE_HOME[user.accountType] || "/login"} replace />;
  return children;
}
