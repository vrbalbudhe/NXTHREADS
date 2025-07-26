import PostHeader from "./PostHeader";
import PostMidLayout from "./PostMidLayout";
import PostActionButtons from "./PostActionButtons";

function PostCard({ post, currentUser }) {
  return (
    <div className="w-full bg-white dark:bg-darkPostCardBg dark:border border border-gray-200 rounded-xl dark:border-gray-700 hover:shadow-md">
      <PostHeader post={post} />
      <PostMidLayout post={post} />
      <PostActionButtons post={post} currentUser={currentUser} />
    </div>
  );
}

export default PostCard;
