export default function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div
      role="tablist"
      className={`no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-white/[0.04] ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              active
                ? "bg-white text-slate-900 shadow-soft dark:bg-panel-dark dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="rounded-full bg-slate-200/80 px-1.5 text-[10px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
