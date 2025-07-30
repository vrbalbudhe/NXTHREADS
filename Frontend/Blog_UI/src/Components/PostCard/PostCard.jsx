import PostHeader from "./PostHeader";
import PostMidLayout from "./PostMidLayout";
import PostActionButtons from "./PostActionButtons";
import { useEffect, useState } from "react";
import UpdatePostModal from "./UpdatePostModal";
import { useParams } from "react-router-dom";

function PostCard({ post, currentUser }) {
  const { id } = useParams();
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("false");
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${baseUrl}/api/post/get/${id}`);
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
    <div className="w-full bg-white dark:bg-darkPostCardBg dark:border dark:shadow-lg border border-gray-300 shadow-md rounded-2xl dark:border-gray-700">
      <PostHeader post={post} setShowEditor={setShowEditor} />
      <PostMidLayout post={post} />
      <PostActionButtons post={post} currentUser={currentUser} />
      {showEditor && (
        <UpdatePostModal post={post} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}

export default PostCard;
