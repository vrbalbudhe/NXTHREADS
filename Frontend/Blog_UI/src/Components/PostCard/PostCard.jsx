/* eslint-disable react/prop-types */
import PostHeader from "./PostHeader";
import PostMidLayout from "./PostMidLayout";
import PostActionButtons from "./PostActionButtons";
import { useState } from "react";
import { useSelector } from "react-redux";
import UpdatePostModal from "./UpdatePostModal";

function PostCard({ post, currentUser }) {
  const [showEditor, setShowEditor] = useState(false);
  const isDeleted = useSelector((state) => Boolean(state.post.deletedPosts[post?.id]));

  if (!post || isDeleted) {
    return null;
  }

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
