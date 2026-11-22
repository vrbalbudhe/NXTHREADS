import { Link } from "react-router-dom";
import { categoryLabel, toneFor } from "../../lib/format";

export default function CategoryChip({ category, linked = true }) {
  if (!category) return null;
  const className = `chip ${toneFor(category)} transition-opacity hover:opacity-80`;
  if (!linked) return <span className={className}>{categoryLabel(category)}</span>;
  return (
    <Link to={`/topics?category=${encodeURIComponent(category)}`} className={className}>
      {categoryLabel(category)}
    </Link>
  );
}
