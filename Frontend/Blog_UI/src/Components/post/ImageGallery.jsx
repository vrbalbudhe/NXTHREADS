import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";

function Lightbox({ images, index, onClose, onMove }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onMove(1);
      if (event.key === "ArrowLeft") onMove(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onMove]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-slate-950/90 p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="Close image"
      />
      <img
        src={images[index]}
        alt=""
        className="relative max-h-[85vh] max-w-full rounded-xl object-contain shadow-lift"
      />
      <div className="absolute right-4 top-4 flex gap-2">
        <a
          href={images[index]}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-btn bg-white/10 text-white hover:bg-white/20 hover:text-white"
          aria-label="Open original"
        >
          <Download className="h-5 w-5" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="icon-btn bg-white/10 text-white hover:bg-white/20 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onMove(-1)}
            className="icon-btn absolute left-3 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            className="icon-btn absolute right-3 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="absolute bottom-5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>,
    document.body
  );
}

export default function ImageGallery({ images = [], max = 4 }) {
  const [open, setOpen] = useState(null);
  if (!images.length) return null;

  const shown = images.slice(0, max);
  const extra = images.length - shown.length;
  const layout =
    shown.length === 1
      ? "grid-cols-1"
      : shown.length === 2
        ? "grid-cols-2"
        : "grid-cols-2 grid-rows-2";

  const move = (delta) => setOpen((value) => (value + delta + images.length) % images.length);

  return (
    <>
      <div
        className={`grid gap-1.5 overflow-hidden rounded-xl ${layout} ${shown.length > 1 ? "aspect-[16/10]" : ""}`}
      >
        {shown.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(index)}
            className={`group relative overflow-hidden bg-slate-100 dark:bg-white/5 ${
              shown.length === 3 && index === 0 ? "row-span-2" : ""
            }`}
            aria-label={`Open image ${index + 1}`}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                shown.length === 1 ? "max-h-[420px]" : ""
              }`}
            />
            {extra > 0 && index === shown.length - 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-xl font-bold text-white">
                +{extra}
              </span>
            )}
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox images={images} index={open} onClose={() => setOpen(null)} onMove={move} />
      )}
    </>
  );
}
