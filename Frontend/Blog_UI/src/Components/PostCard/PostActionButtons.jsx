import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MessageCircle,
  Trash2,
  Send,
} from "lucide-react";

const LikeUnlikeActions = ({ post }) => {
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleLikeButton = () => {
    toggleLike(post.id, currentUser?.userId);
  };

  const handleDislikeButton = () => {
    toggleUnLike(post?.id, currentUser?.userId);
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={() => {
          setLike((prev) => !prev);
          setDislike(false);
          handleLikeButton();
        }}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
      >
        {isLiked ? (
          <ThumbsUp className="w-5 h-5 fill-current" />
        ) : (
          <ThumbsUp className="w-5 h-5" />
        )}
        <span>{post.likes || 0}</span>
      </button>

      <button
        onClick={() => {
          setDislike((prev) => !prev);
          setLike(false);
          handleDislikeButton();
        }}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
      >
        {isDisliked ? (
          <ThumbsDown className="w-5 h-5 fill-current" />
        ) : (
          <ThumbsDown className="w-5 h-5" />
        )}
        <span>{post.unlikes || 0}</span>
      </button>
    </div>
  );
};
const CommentAndDeleteActions = ({
  post,
  currentUser,
  setOpenCommentSection,
}) => {
  const [favourite, setFavourite] = useState(false);

  const handleFavouriteSwitch = async () => {
    if (!currentUser?.userId) {
      console.error("No user info available.");
      return;
    }

    try {
      const res = await axios.post(
        `${baseUrl}/api/post/fav`,
        {
          userId: currentUser?.userId,
          postId: post.id,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setFavourite((prev) => !prev);
    } catch (error) {
      console.error(
        "Error updating favourite status:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className=" flex items-center space-x-4">
      <button
        onClick={() => setOpenCommentSection((open) => !open)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{post.comment.length}</span>
      </button>
      <button
        onClick={handleFavouriteSwitch}
        className={`text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 ${
          favourite ? "text-yellow-500 dark:text-yellow-400" : ""
        }`}
      >
        <Bookmark className={`w-5 h-5 ${favourite ? "fill-current" : ""}`} />
      </button>

      {currentUser?.userInfo?.id === post.userId && (
        <button
          onClick={() => setCardDelete(true)}
          className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
const CommentOpenSection = ({ post, currentUser }) => {
  const [commentData, setCommentData] = useState("");
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddComment = async () => {
    await addComment(commentData.description, post.id);
    setCommentData({ description: "" });
  };

  return (
    <div className="w-full p-2 border-t dark:border-gray-700">
      <div className="flex space-x-2 mb-4">
        <textarea
          name="description"
          value={commentData.description}
          onChange={handleInputChange}
          className="flex-1 p-3 rounded-lg border dark:border-gray-700 dark:bg-transparent dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add a comment..."
          rows="2"
        />
        <button
          onClick={handleAddComment}
          className="px-2 h-fit py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {post.comment.map((com) => (
          <div
            key={com.id}
            className="bg-gray-50 dark:bg-darkPostCardBackground border border-gray-700 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <img
                  src={
                    com?.user?.avatar ||
                    "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"
                  }
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {com?.user?.fullname}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    @{com?.user?.username}
                  </span>
                </div>
              </div>

              {com?.user?.id === currentUser?.userId && (
                <button
                  onClick={() => {
                    setCommentDelete(true);
                    setDeleteCommentId(com._id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {com.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PostActionButtons({ post, currentUser }) {
  const [openCommentSection, setOpenCommentSection] = useState(false);
  return (
    <div className="flex flex-col items-center justify-between border-t dark:border-gray-700">
      <div className="w-full flex justify-between items-center pl-4 pr-4 py-2">
        <LikeUnlikeActions post={post} />
        <CommentAndDeleteActions
          post={post}
          currentUser={currentUser}
          setOpenCommentSection={setOpenCommentSection}
        />
      </div>
      {openCommentSection && (
        <CommentOpenSection post={post} currentUser={currentUser} />
      )}
    </div>
  );
}
