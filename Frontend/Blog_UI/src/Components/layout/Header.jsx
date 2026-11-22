import { Link } from "react-router-dom";
import { Bell, Menu as MenuIcon, MessageSquare, Moon, PenSquare, Search, Sun } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useTheme } from "../../Context/ThemeContext";
import { useChatContext } from "../../Context/ChatContext";
import { useNotifications } from "../../Context/NotificationContext";
import { useStats } from "../../hooks/useCommunity";
import { formatCount } from "../../lib/format";
import Avatar from "../ui/Avatar";
import { LogoMark } from "../ui/Logo";
import Sparkline from "../ui/Sparkline";

function WeeklyStat() {
  const { data } = useStats();
  return (
    <div className="hidden items-center gap-3 border-l border-line pl-4 dark:border-line-dark md:flex">
      <div className="leading-tight">
        <p className="text-[11px] muted">Posts this week</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {data ? `+ ${formatCount(data.postsThisWeek)}` : "—"}
        </p>
      </div>
      <Sparkline values={data?.trend?.slice(-7)} width={56} height={22} />
    </div>
  );
}

export default function Header({ title, onOpenMenu }) {
  const { currentUser } = useAuth();
  const { resolved, toggle } = useTheme();
  const { unreadTotal } = useChatContext();
  const { unread: unreadNotifications } = useNotifications();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-panel/85 backdrop-blur-md dark:border-line-dark dark:bg-panel-dark/85">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          className="icon-btn -ml-1 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <Link to="/" className="lg:hidden" aria-label="NXTHREADS home">
          <LogoMark className="h-8 w-8" />
        </Link>
        <h1 className="ml-1 truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl lg:ml-0">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/explore" className="icon-btn" aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <button type="button" onClick={toggle} className="icon-btn" aria-label="Toggle theme">
            {resolved === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>
          {currentUser && (
            <Link
              to="/notifications"
              className="icon-btn"
              aria-label={
                unreadNotifications
                  ? `Notifications, ${unreadNotifications} unread`
                  : "Notifications"
              }
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadNotifications > 0 && (
                <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white ring-2 ring-white dark:ring-panel-dark">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
          )}
          {currentUser && (
            <Link
              to="/messages"
              className="icon-btn"
              aria-label={`Messages${unreadTotal ? `, ${unreadTotal} unread` : ""}`}
            >
              <MessageSquare className="h-[18px] w-[18px]" />
              {unreadTotal > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-panel-dark" />
              )}
            </Link>
          )}
          {currentUser ? (
            <>
              <Link to="/write" className="btn btn-primary ml-1 hidden sm:inline-flex">
                <PenSquare className="h-4 w-4" />
                Write
              </Link>
              <Link
                to={`/profile/${currentUser.userId}`}
                className="ml-1 lg:hidden"
                aria-label="My profile"
              >
                <Avatar user={currentUser} size="sm" />
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn btn-dark ml-1">
              Sign in
            </Link>
          )}
          <WeeklyStat />
        </div>
      </div>
    </header>
  );
}
