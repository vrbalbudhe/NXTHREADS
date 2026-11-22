import { Check } from "lucide-react";
import { useCategories } from "../../hooks/useCommunity";
import { categoryLabel } from "../../lib/format";
import { Skeleton } from "./Feedback";

export const MAX_TOPICS = 20;

/** Toggleable topic chips. `suggested` topics get a subtle highlight. */
export default function TopicPicker({ value, onChange, suggested = [], disabled }) {
  const { categories, loading } = useCategories();
  const selected = new Set(value);

  const toggle = (name) => {
    if (selected.has(name)) onChange(value.filter((topic) => topic !== name));
    else if (value.length < MAX_TOPICS) onChange([...value, name]);
  };

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, key) => (
          <Skeleton key={key} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Topics">
      {categories.map(({ name, count }) => {
        const on = selected.has(name);
        const hinted = !on && suggested.includes(name);
        return (
          <button
            key={name}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => toggle(name)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-60 ${
              on
                ? "border-brand-600 bg-brand-600 text-white"
                : hinted
                  ? "border-brand-300 bg-brand-50 text-brand-700 hover:border-brand-500 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300"
                  : "border-line text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-line-dark dark:text-slate-300 dark:hover:bg-white/[0.03]"
            }`}
          >
            {on && <Check className="h-3.5 w-3.5" />}
            {categoryLabel(name)}
            {count > 0 && <span className={on ? "opacity-80" : "opacity-50"}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
