import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import PostHeader from "../Components/PostCard/PostHeader";
import PostActionButtons from "../Components/PostCard/PostActionButtons";
import axios from "axios";
import { Hash } from "lucide-react";
import Slider from "../Components/Slider/Slider";
import UpdatePostModal from "../Components/PostCard/UpdatePostModal";

const NavbarMidLayoutTitleSection = ({ post }) => {
  return (
    <>
      <div className="p-4">
        <h1 className="text-xl cursor-pointer font-bold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h1>
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          {post.subtitle}
        </h2>
      </div>

      <div className="px-4 py-2">
        <pre className="text-gray-700 font-sans dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </pre>
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

export default function Blog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${baseUrl}/api/post/get/${id}`, {
          withCredentials: true
        });
        setBlog(res?.data?.posts[0]);
      } catch (err) {
        setError("Failed to load the blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return (
    <div className="w-full min-h-fit p-4 bg-white dark:bg-darkBackground dark:border dark:border-gray-700 rounded-2xl">
      {loading ? (
        <p className="text-sm w-full h-full flex justify-center items-center text-gray-600 dark:text-gray-300">
          Loading blog...
        </p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : blog ? (
        <div className="w-full flex flex-col gap-4">
          <PostHeader post={blog} setShowEditor={setShowEditor} />
          <NavbarMidLayoutTitleSection post={blog} />
          <NavbarMidLayoutImageSection post={blog} />
          <NavbarMidLayoutHashSection post={blog} />
          <PostActionButtons post={blog} currentUser={currentUser} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No blog found with this ID.</p>
      )}
      {showEditor && (
        <UpdatePostModal post={blog} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}
