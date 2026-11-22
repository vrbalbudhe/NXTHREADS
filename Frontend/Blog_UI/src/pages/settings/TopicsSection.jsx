import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../lib/api";
import { categoryLabel } from "../../lib/format";
import SettingsSection from "../../Components/ui/SettingsSection";
import TopicPicker from "../../Components/ui/TopicPicker";
import { ErrorNote, Spinner } from "../../Components/ui/Feedback";

export default function TopicsSection() {
  const [saved, setSaved] = useState(null);
  const [value, setValue] = useState([]);
  const [learned, setLearned] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/user/me/interests")
      .then((res) => {
        setSaved(res.data.interests);
        setValue(res.data.interests);
        setLearned(res.data.learned || []);
      })
      .catch((err) => setError(errorMessage(err, "Could not load your topics")));
  }, []);

  const dirty = saved && JSON.stringify([...value].sort()) !== JSON.stringify([...saved].sort());

  const save = async () => {
    setBusy(true);
    try {
      const res = await api.put("/user/me/interests", { interests: value });
      setSaved(res.data.interests);
      toast.success("Topics saved. Your feed will update");
    } catch (err) {
      toast.error(errorMessage(err, "Could not save your topics"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="topics" className="scroll-mt-20">
      <SettingsSection
        icon={Sparkles}
        title="Your topics"
        description="Shapes your For you feed, topic suggestions and who to follow."
      >
        <div className="space-y-4">
          <ErrorNote message={error} />
          {learned.length > 0 && (
            <p className="text-xs muted">
              Based on what you read, you may also like{" "}
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {learned.map(categoryLabel).join(", ")}
              </span>
              . They&apos;re highlighted below.
            </p>
          )}
          {saved && <TopicPicker value={value} onChange={setValue} suggested={learned} />}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs muted">{value.length} selected</span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={save}
              disabled={!dirty || busy}
            >
              {busy && <Spinner />} Save topics
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
