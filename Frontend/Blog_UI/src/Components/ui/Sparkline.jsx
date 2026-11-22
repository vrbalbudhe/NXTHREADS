import { useId } from "react";

export default function Sparkline({ values = [], width = 72, height = 24, className = "" }) {
  const gradientId = useId();
  const series = values.length > 1 ? values : [0, 0];
  const max = Math.max(...series, 1);
  const step = width / (series.length - 1);
  const points = series.map((value, index) => {
    const x = index * step;
    const y = height - 2 - (value / max) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b66f6" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
