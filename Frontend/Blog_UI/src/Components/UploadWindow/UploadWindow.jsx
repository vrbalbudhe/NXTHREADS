/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

const UploadWindow = ({ imageUrls = [], setImageUrls }) => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dbbcwngff",
        uploadPreset: "nthreads",
        multiple: true,
        cropping: false,
        showAdvancedOptions: false,
        theme: "dark",
        styles: {
          palette: {
            window: "#ffffff",
            windowBorder: "#dddddd",
            tabIcon: "#000000",
            menuIcons: "#000000",
            textDark: "#000000",
            textLight: "#000000",
            link: "#1e90ff",
            action: "#ff4500",
            inactiveTabIcon: "#aaaaaa",
            error: "#ff4500",
            inProgress: "#1e90ff",
            complete: "#32cd32",
            empty: "#ffffff",
            selected: "#1e90ff",
            header: "#1e90ff",
            dropdown: "#1e90ff",
            blue: "#1e90ff",
          },
        },
      },
      (error, result) => {
        if (error) {
          console.error("Upload error:", error);
          return;
        }

        if (result.event === "success") {
          const uploadedImageUrl = result.info.secure_url;
          setImageUrls((prev) => [...prev, uploadedImageUrl]);
        }
      }
    );
  }, [setImageUrls]);

  const handleRemoveImage = (urlToRemove) => {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <button
        type="button"
        onClick={() => widgetRef.current.open()}
        className="w-fit text-xs px-3 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
      >
        Upload Images
      </button>

      {imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {imageUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300"
            >
              <img
                src={url}
                alt={`uploaded-${idx}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(url)}
                className="absolute top-0 right-0 bg-red-600 text-white text-xs px-[6px] py-[1px] rounded-bl-md hover:bg-red-700 z-10"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadWindow;
