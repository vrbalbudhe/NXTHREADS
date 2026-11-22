import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "react-toastify";
import { ACCEPTED_IMAGE_TYPES, uploadImage, uploadsConfigured } from "../../lib/upload";
import { Spinner } from "../ui/Feedback";

export default function ImageUploader({ images, onChange, max = 10, single = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const limit = single ? 1 : max;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, Math.max(0, limit - images.length));
    if (!files.length) {
      if (images.length >= limit)
        toast.info(single ? "Remove the current image first" : `Up to ${limit} images`);
      return;
    }
    setUploading((value) => value + files.length);
    const uploaded = [];
    for (const file of files) {
      try {
        uploaded.push(await uploadImage(file));
      } catch (error) {
        toast.error(`${file.name}: ${error.message}`);
      } finally {
        setUploading((value) => value - 1);
      }
    }
    if (uploaded.length) onChange(single ? uploaded.slice(0, 1) : [...images, ...uploaded]);
  };

  if (!uploadsConfigured) {
    return <p className="text-xs muted">Image uploads are not configured for this environment.</p>;
  }

  return (
    <div className="space-y-3">
      {images.length < limit && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-line hover:border-brand-300 hover:bg-slate-50 dark:border-line-dark dark:hover:bg-white/[0.03]"
          }`}
        >
          {uploading > 0 ? (
            <Spinner className="h-5 w-5 text-brand-600" />
          ) : (
            <ImagePlus className="h-5 w-5 text-brand-600" />
          )}
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            {uploading > 0 ? `Uploading ${uploading}…` : "Drop images or click to upload"}
          </span>
          <span className="text-[11px] muted">JPG, PNG, WEBP or GIF · up to 5 MB each</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple={!single}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src) => (
            <div
              key={src}
              className="group relative aspect-square overflow-hidden rounded-lg border border-line dark:border-line-dark"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(images.filter((image) => image !== src))}
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
