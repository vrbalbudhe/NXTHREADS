/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaCaretLeft, FaCaretRight, FaTimes } from "react-icons/fa";

function Slider({ post, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? post.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === post.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center overflow-hidden z-50">
      <div
        className="absolute  dark:text-white top-2 right-4 w-10 h-10 flex items-center justify-center text-black text-2xl cursor-pointer hover:scale-90 transition-transform duration-300"
        onClick={() => onClose(false)}
      >
        <FaTimes />
      </div>

      <div
        className="absolute  dark:text-white top-1/2 left-0 transform -translate-y-1/2 w-16 h-16 flex items-center justify-center text-black text-4xl cursor-pointer hover:scale-90 transition-transform duration-300"
        onClick={handlePrevClick}
      >
        <FaCaretLeft />
      </div>

      <div className="relative w-[90%] h-1/2 md:h-full flex items-center justify-center overflow-hidden">
        {post.images.length > 0 && (
          <>
            {post.images.map((image, index) => (
              <div
                key={index}
                className={`absolute transition-opacity duration-500 flex justify-center items-center ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                {image.endsWith("mp4") ? (
                  <iframe
                    src={image}
                    title={`video-${index}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="encrypted-media"
                    allowFullScreen
                    className="w-full h-full object-cover rounded-lg border border-slate-300 shadow-md"
                  ></iframe>
                ) : (
                  <img
                    src={image}
                    alt={`Content-Id::${post.id}::image ${index}`}
                    className="w-[90%] h-[90vh] object-cover rounded-lg"
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div
        className="absolute dark:text-white top-1/2 right-0 transform -translate-y-1/2 w-16 h-16 flex items-center justify-center text-black text-4xl cursor-pointer hover:scale-90 transition-transform duration-300"
        onClick={handleNextClick}
      >
        <FaCaretRight />
      </div>
    </div>
  );
}

export default Slider;
