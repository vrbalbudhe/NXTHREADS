import React, { useState } from "react";
import Slider from "../Slider/Slider";
import { Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NavbarMidLayoutTitleSection = ({ post }) => {
  return (
    <>
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h1>
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          {post.subtitle}
        </h2>
      </div>

      <div className="px-4 py-2">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {post.content}
        </p>
      </div>
    </>
  );
};
const NavbarMidLayoutImageSection = ({ post }) => {
  const [showSlider, setShowSlider] = useState(false);
  return (
    <>
      {post.images && showSlider ? (
        <Slider post={post} onClose={() => setShowSlider(false)} />
      ) : (
        post.images?.length > 0 && (
          <div onClick={() => setShowSlider(true)} className="p-4 space-y-4">
            {post.images.map((image, index) =>
              image.endsWith("mp4") ? (
                <video
                  key={`${post.id}-${index}`}
                  src={image}
                  controls
                  className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                />
              ) : (
                <img
                  key={`${post.id}-${index}`}
                  src={image}
                  alt={`Content ${index + 1}`}
                  className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                />
              )
            )}
          </div>
        )
      )}
    </>
  );
};
const NavbarMidLayoutHashSection = ({ post }) => {
  const navigate = useNavigate();
  return (
    <div className="px-4 py-2">
      <button
        onClick={() => navigate(`/list?category=${post.category}&author=`)}
        className="inline-flex items-center space-x-1 px-3 py-1 bg-darkPostCardBackground dark:border dark:border-gray-700 text-white rounded-xl hover:text-blue-400"
      >
        <Hash className="w-4 h-4" />
        <span>{post.category}</span>
      </button>
    </div>
  );
};

function PostMidLayout({ post }) {
  return (
    <div>
      <NavbarMidLayoutTitleSection post={post} />
      <NavbarMidLayoutImageSection post={post} />
      <NavbarMidLayoutHashSection post={post} />
    </div>
  );
}

export default PostMidLayout;
