import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Moon, Sun } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../Context/AuthContext";
import { useTheme } from "../../Context/ThemeContext";
import { useChatContext } from "../../Context/ChatContext";
import { useStats } from "../../hooks/useCommunity";
import { displayName, formatCount } from "../../lib/format";
import Avatar from "../ui/Avatar";
import { LogoMark } from "../ui/Logo";
import Sparkline from "../ui/Sparkline";
import { accountNav, infoNav, mainNav } from "./navigation";

function NavItem({ item, onNavigate, badge }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
          isActive
            ? "bg-slate-100 text-slate-900 dark:bg-white/[0.06] dark:text-white"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white"
        }`
      }
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {badge > 0 && (
        <span className="min-w-5 rounded-full bg-rose-500 px-1.5 text-center text-[10px] font-bold leading-5 text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}

function CommunityCard() {
  const { data } = useStats();
  return (
    <div className="rounded-xl2 bg-brand-50 p-4 dark:bg-brand-500/10">
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Community</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {data ? formatCount(data.posts) : "—"}
          <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            posts
          </span>
        </p>
        <Sparkline values={data?.trend} />
      </div>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        {data
          ? `${formatCount(data.writers)} writers · ${formatCount(data.comments)} comments`
          : "Loading community"}
      </p>
    </div>
  );
}

export default function Sidebar({ onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { resolved, toggle } = useTheme();
  const { unreadTotal } = useChatContext();
  const navigate = useNavigate();

  const visible = (items) => items.filter((item) => !item.auth || currentUser);

  const handleLogout = async () => {
    onNavigate?.();
    await logout();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-4 py-6">
      <Link to="/" onClick={onNavigate} className="flex flex-col items-center gap-2 pb-1">
        <LogoMark className="h-11 w-11" />
        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
          NXTHREADS
        </span>
      </Link>

      {currentUser ? (
        <Link
          to={`/profile/${currentUser.userId}`}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl border border-line p-2.5 transition-colors hover:bg-slate-50 dark:border-line-dark dark:hover:bg-white/[0.04]"
        >
          <Avatar user={currentUser} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-white">
              {displayName(currentUser)}
            </span>
            <span className="block truncate text-[11px] muted">@{currentUser.username}</span>
          </span>
        </Link>
      ) : (
        <div className="rounded-xl border border-line p-3 dark:border-line-dark">
          <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
            Join the conversation
          </p>
          <p className="mt-0.5 text-[11px] muted">Write, follow writers and chat in real time.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/login" onClick={onNavigate} className="btn btn-secondary btn-sm">
              Sign in
            </Link>
            <Link to="/register" onClick={onNavigate} className="btn btn-primary btn-sm">
              Join
            </Link>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-0.5" aria-label="Main">
        <p className="section-label mb-1.5">Menu</p>
        {visible(mainNav).map((item) => (
          <NavItem
            key={item.to}
            item={item}
            onNavigate={onNavigate}
            badge={item.badge === "messages" ? unreadTotal : 0}
          />
        ))}
      </nav>

      <nav className="flex flex-col gap-0.5" aria-label="Account">
        <p className="section-label mb-1.5">{currentUser ? "Account" : "Information"}</p>
        {visible(accountNav(currentUser?.userId)).map((item) => (
          <NavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
        {infoNav.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white"
        >
          {resolved === "dark" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
          {resolved === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {currentUser ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        ) : (
          <NavItem item={{ to: "/login", label: "Sign in", icon: LogIn }} onNavigate={onNavigate} />
        )}
      </nav>

      <div className="mt-auto pt-2">
        <CommunityCard />
      </div>
    </div>
  );
}
