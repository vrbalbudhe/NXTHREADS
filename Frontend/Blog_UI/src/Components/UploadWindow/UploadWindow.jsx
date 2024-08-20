/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

const UploadWindow = ({ setImageUrls }) => {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dbbcwngff",
        uploadPreset: "nthreads",
        multiple: true, // Allow multiple uploads
        cropping: true, // Enable cropping
        showAdvancedOptions: true, // Show advanced options
        theme: "dark", // Change to 'dark' for a dark theme
        styles: {
          palette: {
            window: "#ffffff", // White background
            windowBorder: "#dddddd", // Light grey border
            tabIcon: "#000000", // Black icon color
            menuIcons: "#000000", // Black menu icons
            textDark: "#000000", // Black text for dark mode
            textLight: "#000000", // Black text
            link: "#1e90ff", // Bright blue for links
            action: "#ff4500", // Orange for actions (like delete)
            inactiveTabIcon: "#aaaaaa", // Light grey for inactive tabs
            error: "#ff4500", // Orange for error messages
            inProgress: "#1e90ff", // Bright blue for progress
            complete: "#32cd32", // Lime green for completed actions
            empty: "#ffffff", // White background for empty states
            selected: "#1e90ff", // Bright blue for selected items
            header: "#1e90ff", // Bright blue for header
            dropdown: "#1e90ff", // Matching blue for dropdowns
            blue: "#1e90ff", // Consistent blue throughout
          },
        },
      },
      (error, result) => {
        if (result.event === "success") {
          const uploadedImageUrl = result.info.secure_url;
          console.log("Upload successful:", uploadedImageUrl);
          setImageUrls((prevUrls) => [...prevUrls, uploadedImageUrl]);
        } else if (error) {
          console.error("Upload error:", error);
        }
      }
    );
  }, [setImageUrls]);

  return (
    <button
      className="text-xs px-2 py-2 bg-blue-400 text-white font-semibold rounded hover:bg-blue-500"
      onClick={() => widgetRef.current.open()}
    >
      Upload Pics
    </button>
  );
};

export default UploadWindow;
