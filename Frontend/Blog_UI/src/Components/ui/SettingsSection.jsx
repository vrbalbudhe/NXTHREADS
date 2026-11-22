export default function SettingsSection({ icon: Icon, title, description, children, tone, aside }) {
  return (
    <section
      className={`card ${tone === "danger" ? "border-rose-200 dark:border-rose-500/30" : ""}`}
    >
      <header className="card-header">
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            tone === "danger"
              ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
              : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs muted">{description}</p>}
        </div>
        {aside}
      </header>
      <div className="card-pad">{children}</div>
    </section>
  );
}
