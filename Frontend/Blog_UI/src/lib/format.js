const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const UNITS = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export const timeAgo = (value) => {
  if (!value) return "";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  if (Math.abs(seconds) < 45) return "just now";
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit);
    }
  }
  return relative.format(Math.round(seconds / 60), "minute");
};

export const formatDate = (value, options = { day: "numeric", month: "short", year: "numeric" }) =>
  value ? new Date(value).toLocaleDateString("en", options) : "";

export const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) : "";

export const formatCount = (value) => compact.format(value || 0);

export const categoryLabel = (value) => (value || "").replace(/_/g, " ");

export const CATEGORIES = [
  "Technology",
  "Programming",
  "Web_Development",
  "Mobile_Development",
  "Software_Engineering",
  "Data_Science",
  "Cybersecurity",
  "Cloud_Computing",
  "Blockchain",
  "Digital_Marketing",
  "Entrepreneurship",
  "Design",
  "Gaming",
  "Health_and_Wellness",
  "Travel",
  "Food_and_Cooking",
  "Fashion",
  "Photography",
  "Sports",
  "Personal_Development",
];

const TONES = [
  "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
];

const hash = (value) => {
  let result = 0;
  for (const char of value || "") {
    result = (result * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(result);
};

export const toneFor = (value) => TONES[hash(value) % TONES.length];

const AVATAR_TONES = [
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-indigo-400 to-blue-700",
];

export const avatarToneFor = (value) => AVATAR_TONES[hash(value) % AVATAR_TONES.length];

export const initialsOf = (user) => {
  const source = (user?.fullname || user?.username || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
};

export const displayName = (user) => user?.fullname?.trim() || user?.username || "Unknown";

export const readingTime = (text) =>
  Math.max(1, Math.round((text || "").split(/\s+/).length / 220));
