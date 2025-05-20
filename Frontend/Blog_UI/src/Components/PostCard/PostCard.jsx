import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PostContext } from "../../Context/PostContext";
import { CommentContext } from "../../Context/CommentContext";
import { LikeContext } from "../../Context/LikeContext";
import Slider from "../Slider/Slider";
import DialogBox from "../DialogBox/DialogBox";
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MoreVertical,
  MessageCircle,
  Flag,
  Ban,
  Info,
  Send,
  Trash2,
  Calendar,
  Clock,
  Hash,
} from "lucide-react";

function PostCard({ post }) {
  const { currentUser } = useContext(AuthContext);
  const {
    addComment,
    setInfo,
    fetchComments,
    setCurrentPostId,
    info,
    comments,
    setComments,
  } = useContext(CommentContext);

  const {
    likes,
    setLikes,
    toggleLike,
    checkWhether,
    isliked,
    loading,
    error,
    toggleUnLike,
  } = useContext(LikeContext);

  const { HandleDeleteBlog } = useContext(PostContext);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [favourite, setFavourite] = useState(false);
  const [cardDelete, setCardDelete] = useState(false);
  const [commentDelete, setCommentDelete] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [isdropdown, setIsDropDown] = useState(false);
  const [commentBtn, setCommentBtn] = useState(false);
  const [commentData, setCommentData] = useState({ description: "" });
  const [deleteCommentId, setDeleteCommentId] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleDropDownMenu = () => {
    setIsDropDown(!isdropdown);
  };

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

  const handleLikeButton = () => {
    toggleLike(post.id, currentUser?.userId);
  };

  const handleDislikeButton = () => {
    toggleUnLike(post?.id, currentUser?.userId);
  };

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

  const closeDialogHandler = (shouldDelete) => {
    setCardDelete(false);
    if (shouldDelete) {
      HandleDeleteBlog(post.id);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`${baseUrl}/api/comment/delete/${deleteCommentId}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handlecommentDelete = (shouldDelete) => {
    setCommentDelete(false);
    if (shouldDelete) {
      handleDeleteComment();
    }
  };

  useEffect(() => {
    fetchComments(post.id);
    setCurrentPostId(post.id);

    // const checkLikeStatus = async () => {
    //   const status = await checkWhether(post.id, currentUser?.userId);
    //   if (status) {
    //     setIsLiked(status.isLiked);
    //     setIsDisliked(status.isUnliked);
    //   }
    // };
    // checkLikeStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setIsDropDown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white dark:bg-gray-800 dark:border-none border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-6">
      <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={
              post?.User?.avatar ||
              "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"
            }
            alt={post.author}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {post.author}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <Clock className="w-3 h-3" />
              <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={handleDropDownMenu}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {isdropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
              <ul className="py-2">
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <Flag className="w-4 h-4 mr-2" />
                  <span>Report</span>
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <Ban className="w-4 h-4 mr-2" />
                  <span>Block</span>
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  <Info className="w-4 h-4 mr-2" />
                  <span>About</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {post.title}
        </h1>
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          {post.subtitle}
        </h2>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Images/Videos */}
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

      {/* Categories */}
      <div className="px-4 py-2">
        <button
          onClick={() => navigate(`/list?category=${post.category}&author=`)}
          className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          <Hash className="w-4 h-4" />
          <span>{post.category}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
        <div className="flex items-center space-x-6">
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

          <button
            onClick={() => setCommentBtn((prev) => !prev)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comment.length}</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleFavouriteSwitch}
            className={`text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 ${
              favourite ? "text-yellow-500 dark:text-yellow-400" : ""
            }`}
          >
            <Bookmark
              className={`w-5 h-5 ${favourite ? "fill-current" : ""}`}
            />
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
      </div>

      {/* Comments Section */}
      {commentBtn && (
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex space-x-2 mb-4">
            <textarea
              name="description"
              value={commentData.description}
              onChange={handleInputChange}
              className="flex-1 p-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a comment..."
              rows="2"
            />
            <button
              onClick={handleAddComment}
              className="px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {post.comment.map((com) => (
              <div
                key={com.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow-sm"
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
      )}

      {/* Dialogs */}
      {cardDelete && (
        <DialogBox
          message="Do you want to delete the post?"
          closeDialog={closeDialogHandler}
          trigger="Delete"
        />
      )}
      {commentDelete && (
        <DialogBox
          message="Do you want to delete the comment?"
          closeDialog={handlecommentDelete}
          trigger="Delete"
        />
      )}
    </div>
  );
}

export default PostCard;
