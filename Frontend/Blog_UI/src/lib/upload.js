const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const uploadsConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export const validateImage = (file) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Only JPG, PNG, WEBP or GIF images are allowed";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Images must be 5 MB or smaller";
  }
  return null;
};

export const uploadImage = async (file, signal) => {
  if (!uploadsConfigured) {
    throw new Error("Image uploads are not configured");
  }
  const problem = validateImage(file);
  if (problem) {
    throw new Error(problem);
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body,
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Upload failed");
  }
  return data.secure_url;
};
