import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";
import { ShellContext } from "./ShellContext";

export default function AppShell() {
  const [title, setTitleState] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const setTitle = useCallback((value) => setTitleState(value || ""), []);
  const shell = useMemo(() => ({ setTitle }), [setTitle]);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <ShellContext.Provider value={shell}>
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-panel dark:border-line-dark dark:bg-panel-dark lg:block">
          <Sidebar />
        </aside>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]"
            />
            <aside className="relative h-full w-[280px] max-w-[85vw] animate-slide-in-left bg-panel shadow-lift dark:bg-panel-dark">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="icon-btn absolute right-3 top-3 z-10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <Header title={title} onOpenMenu={() => setDrawerOpen(true)} />
          <main className="mx-auto w-full max-w-[1320px] px-3 pb-28 pt-4 sm:px-6 sm:pt-5 lg:pb-10">
            <Outlet />
          </main>
        </div>

        <MobileNav />
      </div>
    </ShellContext.Provider>
  );
}

export function RequireAuth({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}

export function GuestOnly({ children }) {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/" replace />;
  return children;
}
