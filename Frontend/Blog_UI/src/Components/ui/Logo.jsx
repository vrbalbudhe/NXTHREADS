const SIZES = {
  sm: { mark: "h-8 w-8", text: "text-sm" },
  md: { mark: "h-10 w-10", text: "text-base" },
  lg: { mark: "h-14 w-14", text: "text-xl" },
};

export function LogoMark({ className = "h-10 w-10" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M32 3l25 14.5v29L32 61 7 46.5v-29z" className="fill-slate-900 dark:fill-white" />
      <path
        d="M22 42V22h4.2l11.6 13.4V22H42v20h-4.2L26.2 28.6V42z"
        className="fill-white dark:fill-slate-900"
      />
    </svg>
  );
}

export default function Logo({ size = "md", showText = false }) {
  const { mark, text } = SIZES[size] || SIZES.md;
  return (
    <span className="inline-flex flex-col items-center gap-2">
      <LogoMark className={mark} />
      {showText && (
        <span className={`${text} font-bold tracking-tight text-slate-900 dark:text-white`}>
          NXTHREADS
        </span>
      )}
    </span>
  );
}
