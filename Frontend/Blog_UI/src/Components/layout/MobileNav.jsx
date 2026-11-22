import { NavLink } from "react-router-dom";
import { Compass, Home, LayoutGrid, MessageSquare, PenSquare, UserRound } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import { useChatContext } from "../../Context/ChatContext";

export default function MobileNav() {
  const { currentUser } = useAuth();
  const { unreadTotal } = useChatContext();

  const items = currentUser
    ? [
        { to: "/", label: "Home", icon: Home, end: true },
        { to: "/explore", label: "Explore", icon: Compass },
        { to: "/write", label: "Write", icon: PenSquare, primary: true },
        { to: "/messages", label: "Chats", icon: MessageSquare, badge: unreadTotal },
        { to: `/profile/${currentUser.userId}`, label: "Profile", icon: UserRound },
      ]
    : [
        { to: "/", label: "Home", icon: Home, end: true },
        { to: "/explore", label: "Explore", icon: Compass },
        { to: "/topics", label: "Topics", icon: LayoutGrid },
        { to: "/login", label: "Sign in", icon: UserRound },
      ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 pb-safe backdrop-blur-md dark:border-line-dark dark:bg-panel-dark/95 lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                isActive
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400"
              }`
            }
          >
            {item.primary ? (
              <span className="-mt-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lift">
                <item.icon className="h-5 w-5" />
              </span>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            {item.label}
            {item.badge > 0 && (
              <span className="absolute right-[22%] top-1.5 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
