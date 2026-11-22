import { Link } from "react-router-dom";
import { ChevronRight, Gauge } from "lucide-react";

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="no-scrollbar flex items-center gap-1.5 overflow-x-auto text-xs"
    >
      <Link
        to="/"
        className="inline-flex text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        aria-label="Home"
      >
        <Gauge className="h-4 w-4" />
      </Link>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            {item.to && !last ? (
              <Link
                to={item.to}
                className="font-semibold text-slate-700 hover:text-brand-600 dark:text-slate-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className={last ? "max-w-[220px] truncate muted" : "font-semibold"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
