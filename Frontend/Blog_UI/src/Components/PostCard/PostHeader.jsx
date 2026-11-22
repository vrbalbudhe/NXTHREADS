import { Calendar, Clock, Edit } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";

const UserHeadingSection = ({ post }) => {
  const UndefinedImage =
    "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png";

  return (
    <div className="flex items-center space-x-3">
      <img
        src={post?.User?.avatar || UndefinedImage}
        alt={post.author}
        className="w-10 h-10 rounded-full text-white dark:text-white object-cover"
      />
      <div>
        <h2 className="font-semibold text-gray-800 dark:text-white">{post.author}</h2>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-white">
          <Calendar className="w-3 h-3" />
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <Clock className="w-3 h-3" />
          <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

const UpdateButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-gray-800 dark:text-gray-300 select-none hover:text-blue-600 transition"
    >
      <Edit size={18} />
    </button>
  );
};

function PostHeader({ post, setShowEditor }) {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
      <UserHeadingSection post={post} />
      {currentUser?.userId === post?.userId && <UpdateButton onClick={() => setShowEditor(true)} />}
    </div>
  );
}

export default PostHeader;
