import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Hash, LayoutGrid, PenSquare, Search } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useCategories } from "../hooks/useCommunity";
import { usePaged } from "../hooks/usePaged";
import { categoryLabel, toneFor } from "../lib/format";
import { useShellTitle } from "../Components/layout/ShellContext";
import Breadcrumbs from "../Components/ui/Breadcrumbs";
import { Skeleton } from "../Components/ui/Feedback";
import PostList from "../Components/post/PostList";

function TopicList({ categories, loading, selected, onSelect }) {
  const [filter, setFilter] = useState("");
  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return categories.filter((topic) => categoryLabel(topic.name).toLowerCase().includes(term));
  }, [categories, filter]);
  const total = categories.reduce((sum, topic) => sum + topic.count, 0);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line p-3 dark:border-line-dark">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Find a topic"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Find a topic"
          />
        </div>
      </div>
      <ul className="max-h-[calc(100vh-14rem)] divide-y divide-line overflow-y-auto dark:divide-line-dark">
        <li>
          <button
            type="button"
            onClick={() => onSelect("")}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
              !selected
                ? "bg-slate-50 dark:bg-white/[0.04]"
                : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
            }`}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-slate-900 dark:text-white">
                All topics
              </span>
              <span className="block text-[11px] muted">{total} posts</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
        </li>
        {loading
          ? [0, 1, 2, 3, 4, 5].map((key) => (
              <li key={key} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-3 flex-1" />
              </li>
            ))
          : visible.map((topic) => {
              const active = topic.name === selected;
              return (
                <li key={topic.name}>
                  <button
                    type="button"
                    onClick={() => onSelect(topic.name)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      active
                        ? "bg-slate-50 dark:bg-white/[0.04]"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneFor(topic.name)}`}
                    >
                      <Hash className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-white">
                        {categoryLabel(topic.name)}
                      </span>
                      <span className="block text-[11px] muted">
                        {topic.count} {topic.count === 1 ? "post" : "posts"}
                      </span>
                    </span>
                    {active ? (
                      <span className="h-2 w-2 rounded-full bg-brand-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                </li>
              );
            })}
      </ul>
    </div>
  );
}

function TopicChips({ categories, selected, onSelect }) {
  return (
    <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 lg:hidden">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`chip shrink-0 py-1.5 ${!selected ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 ring-1 ring-line dark:bg-panel-dark dark:text-slate-300 dark:ring-line-dark"}`}
      >
        All
      </button>
      {categories.map((topic) => (
        <button
          key={topic.name}
          type="button"
          onClick={() => onSelect(topic.name)}
          className={`chip shrink-0 py-1.5 ${
            topic.name === selected
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "bg-white text-slate-600 ring-1 ring-line dark:bg-panel-dark dark:text-slate-300 dark:ring-line-dark"
          }`}
        >
          {categoryLabel(topic.name)}
          <span className="opacity-60">{topic.count}</span>
        </button>
      ))}
    </div>
  );
}

export default function Topics() {
  const { currentUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const selected = params.get("category") || "";
  const { categories, loading } = useCategories();
  const label = selected ? categoryLabel(selected) : "All topics";
  useShellTitle("Topics");

  const feed = usePaged("/post/fltr", { params: selected ? { category: selected } : {} });
  const active = categories.find((topic) => topic.name === selected);

  const select = (name) => setParams(name ? { category: name } : {}, { replace: false });

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Topics", to: "/topics" }, ...(selected ? [{ label }] : [])]} />
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TopicList
              categories={categories}
              loading={loading}
              selected={selected}
              onSelect={select}
            />
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <TopicChips categories={categories} selected={selected} onSelect={select} />
          <div className="card card-pad flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${selected ? toneFor(selected) : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"}`}
              >
                {selected ? <Hash className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {label}
                </h2>
                <p className="text-xs muted">
                  {feed.loading
                    ? "Loading posts"
                    : `${feed.total} ${feed.total === 1 ? "post" : "posts"}`}
                  {active && !feed.loading && ` · ${active.count} total in this topic`}
                </p>
              </div>
            </div>
            {currentUser && (
              <Link to="/write" className="btn btn-primary btn-sm">
                <PenSquare className="h-3.5 w-3.5" /> Write in {selected ? label : "a topic"}
              </Link>
            )}
          </div>
          <PostList
            feed={feed}
            empty={{
              icon: Hash,
              title: `No posts in ${label} yet`,
              description: "Start the conversation with the first post.",
              action: currentUser ? (
                <Link to="/write" className="btn btn-primary btn-sm">
                  Write a post
                </Link>
              ) : null,
            }}
          />
        </section>
      </div>
    </div>
  );
}
