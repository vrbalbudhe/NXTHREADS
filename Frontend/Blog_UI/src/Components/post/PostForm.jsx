import { useMemo, useState } from "react";
import { Eye, PenLine } from "lucide-react";
import { CATEGORIES, categoryLabel, readingTime } from "../../lib/format";
import { useAuth } from "../../Context/AuthContext";
import CategoryChip from "../ui/CategoryChip";
import Tabs from "../ui/Tabs";
import { Spinner } from "../ui/Feedback";
import ImageUploader from "./ImageUploader";
import ImageGallery from "./ImageGallery";
import { PostAuthor } from "./PostCard";

const LIMITS = { title: 200, subtitle: 300, content: 50000 };

function Counter({ value, max }) {
  return (
    <span className={`text-[11px] ${value > max * 0.9 ? "text-amber-600" : "muted"}`}>
      {value}/{max}
    </span>
  );
}

function Preview({ draft }) {
  const { currentUser } = useAuth();
  const post = useMemo(
    () => ({
      ...draft,
      userId: currentUser?.userId,
      User: currentUser,
      createdAt: new Date().toISOString(),
    }),
    [draft, currentUser]
  );
  return (
    <article className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <PostAuthor post={post} />
        <CategoryChip category={draft.category} linked={false} />
      </div>
      <h2 className="text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white">
        {draft.title || "Your title appears here"}
      </h2>
      {draft.subtitle && (
        <p className="font-medium text-slate-600 dark:text-slate-300">{draft.subtitle}</p>
      )}
      <ImageGallery images={draft.images} />
      <p className="whitespace-pre-line text-[14px] leading-7 text-slate-700 dark:text-slate-200">
        {draft.content || "Start writing to see a preview."}
      </p>
    </article>
  );
}

export default function PostForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [draft, setDraft] = useState(() => ({
    title: initial?.title || "",
    subtitle: initial?.subtitle || "",
    category: initial?.category || "Technology",
    content: initial?.content || "",
    images: initial?.images || [],
  }));
  const [mode, setMode] = useState("write");
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) =>
    setDraft((current) => ({ ...current, [field]: event.target.value }));
  const valid = draft.title.trim() && draft.subtitle.trim() && draft.content.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    await onSubmit({
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      content: draft.content.trim(),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="card card-pad space-y-4">
        <Tabs
          className="xl:hidden"
          value={mode}
          onChange={setMode}
          tabs={[
            { value: "write", label: "Write", icon: PenLine },
            { value: "preview", label: "Preview", icon: Eye },
          ]}
        />

        {mode === "preview" ? (
          <div className="xl:hidden">
            <Preview draft={draft} />
          </div>
        ) : null}

        <div className={`space-y-4 ${mode === "preview" ? "hidden xl:block" : ""}`}>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="post-title" className="label">
                Title
              </label>
              <Counter value={draft.title.length} max={LIMITS.title} />
            </div>
            <input
              id="post-title"
              className="input h-11 text-base font-semibold"
              value={draft.title}
              maxLength={LIMITS.title}
              onChange={set("title")}
              placeholder="A clear, catchy title"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="post-subtitle" className="label">
                Subtitle
              </label>
              <Counter value={draft.subtitle.length} max={LIMITS.subtitle} />
            </div>
            <input
              id="post-subtitle"
              className="input"
              value={draft.subtitle}
              maxLength={LIMITS.subtitle}
              onChange={set("subtitle")}
              placeholder="One line that sums it up"
              required
            />
          </div>

          <div>
            <label htmlFor="post-category" className="label">
              Topic
            </label>
            <select
              id="post-category"
              className="input"
              value={draft.category}
              onChange={set("category")}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="post-content" className="label">
                Story
              </label>
              <span className="text-[11px] muted">
                {readingTime(draft.content)} min read ·{" "}
                <Counter value={draft.content.length} max={LIMITS.content} />
              </span>
            </div>
            <textarea
              id="post-content"
              className="textarea min-h-[260px]"
              value={draft.content}
              maxLength={LIMITS.content}
              onChange={set("content")}
              placeholder="Tell your story…"
              required
            />
          </div>

          <div>
            <span className="label">Images</span>
            <ImageUploader
              images={draft.images}
              onChange={(images) => setDraft((current) => ({ ...current, images }))}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 dark:border-line-dark sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={!valid || saving}>
            {saving && <Spinner />}
            {submitLabel}
          </button>
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="card card-pad sticky top-20">
          <p className="section-label mb-3 px-0">Live preview</p>
          <Preview draft={draft} />
        </div>
      </aside>
    </form>
  );
}
