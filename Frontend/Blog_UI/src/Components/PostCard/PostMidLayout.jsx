import React, { useState } from "react";
import Slider from "../Slider/Slider";
import { Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NavbarMidLayoutTitleSection = ({ post }) => {
  const [wordLimit, setWordLimit] = useState(300);
  const navigate = useNavigate();

  const handleWordLimit = (limit) => {
    if (wordLimit !== limit) {
      setWordLimit((wordLimit) => limit);
    } else {
      setWordLimit((wordLimit) => 300);
    }
  };
  return (
    <>
      <div className="p-4">
        <h1
          onClick={() => navigate(`/blog/${post?.id}`)}
          className="text-xl w-fit md:hover:underline cursor-pointer font-bold text-gray-900 dark:text-white mb-2"
        >
          {post.title}
        </h1>
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          {post.subtitle}
        </h2>
      </div>

      <div className="px-4 py-2">
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
          {post.content.slice(0, wordLimit)}
          {wordLimit != post.content.length && <span>. . .</span>}
          {post.content.length >= 300 && (
            <span
              onClick={() => handleWordLimit(post.content.length)}
              className="dark:text-orange-300 text-orange-400 cursor-pointer block md:dark:hover:text-orange-400"
            >
              {wordLimit === post.content.length ? " Read Less" : " Read More"}
            </span>
          )}
        </div>
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
          <div onClick={() => setShowSlider(true)} className="p-2 space-y-4">
            {post.images.map((image, index) =>
              image.endsWith("mp4") ? (
                <video
                  key={`${post.id}-${index}`}
                  src={image}
                  controls
                  className="w-full rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300"
                />
              ) : (
                <img
                  key={`${post.id}-${index}`}
                  src={image}
                  alt={`Content ${index + 1}`}
                  className="w-full rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300"
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
    <div className="px-2 py-1">
      <button
        onClick={() => navigate(`/list?category=${post.category}&author=`)}
        className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-sky-500 text-sm font-body hover:text-blue-500"
      >
        <Hash className="w-4 h-4" />
        <span>{post.category}</span>
      </button>
    </div>
  );
};

function PostMidLayout({ post }) {
  return (
    <div className="">
      <NavbarMidLayoutTitleSection post={post} />
      <NavbarMidLayoutImageSection post={post} />
      <NavbarMidLayoutHashSection post={post} />
    </div>
  );
}

export default PostMidLayout;
