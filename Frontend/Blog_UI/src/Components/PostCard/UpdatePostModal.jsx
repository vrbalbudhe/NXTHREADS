/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function UpdatePostModal({ post, onClose }) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    category: "",
    author: "",
    content: "",
    images: [],
  });

  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || "",
        subtitle: post.subtitle || "",
        category: post.category || "",
        author: post.author || "",
        content: post.content || "",
        images: post.images || [],
      });
    }
  }, [post]);

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dbbcwngff",
        uploadPreset: "nthreads",
        multiple: true,
        cropping: false,
        theme: "dark",
      },
      (error, result) => {
        if (error) {
          toast.error("Image upload failed.");
          console.error(error);
          return;
        }
        if (result.event === "success") {
          const uploadedImageUrl = result.info.secure_url;
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, uploadedImageUrl],
          }));
        }
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveImage = (url) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.put(`${baseUrl}/api/post/upd/${post.id}`, form, {
        withCredentials: true,
      });
      if (res.data.success) {
        onClose();
        toast.success("Post updated successfully!");
        window.location.reload();
      } else {
        toast.error("Failed to update post.");
      }
    } catch (err) {
      toast.error("Unable to update the Post");
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="md:w-full w-[95%] md:max-w-4xl bg-white dark:bg-darkPostCardBackground rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
          Edit Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full px-3 py-2 border dark:bg-darkPostCardBackground dark:text-white dark:border-gray-700 border-gray-300 rounded-2xl text-sm"
          />
          <input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            placeholder="Subtitle"
            className="w-full px-3 py-2 dark:bg-darkPostCardBackground dark:text-white border border-gray-300 dark:border-gray-700 rounded-2xl text-sm"
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full px-3 py-2 dark:bg-darkPostCardBackground dark:text-white border border-gray-300 dark:border-gray-700 rounded-2xl text-sm"
          />
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Author"
            disabled={true}
            className="w-full px-3 py-2 dark:bg-darkPostCardBackground dark:text-white border border-gray-300 dark:border-gray-700 rounded-2xl text-sm"
          />
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Content"
            rows={6}
            className="w-full px-3 py-2 dark:bg-darkPostCardBackground dark:text-white border border-gray-300 dark:border-gray-700 rounded-2xl text-sm"
          />

          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 border border-gray-300 rounded-lg overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`img-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img)}
                    className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 py-[1px] rounded-bl-md hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => widgetRef.current.open()}
            className="bg-gray-700 text-white px-2 py-2 mr-2 rounded-md hover:bg-gray-800 transition text-sm"
          >
            Upload Images
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
          >
            Update Post
          </button>
        </form>
      </div>
    </div>
  );
}
