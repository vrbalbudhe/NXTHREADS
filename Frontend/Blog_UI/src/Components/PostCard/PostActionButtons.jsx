import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bookmark,
  MessageCircle,
  Send,
  HeartOff,
  Heart,
  Trash2,
} from "lucide-react";
import {
  fetchPostLikeStatus,
  likePostThunk,
  unlikePostThunk,
  fetchCommentsByPostId,
  createCommentThunk,
  deleteCommentThunk,
  deletePost,
  fetchAllPosts,
} from "../../ReduxThunkSlice/PostSlice";
import { useNavigate } from "react-router-dom";
import DialogBox from "../DialogBox/DialogBox";

const LikeUnlikeActions = ({ post, currentUser }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const likeState = useSelector((state) => state.post.likedPosts[post?.id]) || {
    isLiked: false,
    isUnliked: false,
  };

  const updatedPost = useSelector((state) =>
    state.post.posts.find((p) => p.id === post.id)
  );

  const handleLikeButton = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    dispatch(likePostThunk({ postId: post.id, userId: currentUser.userId }));
  };

  const handleDislikeButton = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    dispatch(unlikePostThunk({ postId: post.id, userId: currentUser.userId }));
  };

  useEffect(() => {
    if (currentUser) {
      dispatch(
        fetchPostLikeStatus({ postId: post.id, userId: currentUser.userId })
      );
    }
  }, [post.id]);

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={handleLikeButton}
        className={`flex items-center space-x-2 hover:text-white ${
          likeState.isLiked ? "text-white" : "text-gray-600"
        }`}
      >
        <Heart className="w-5 h-5" />
        <span>{updatedPost?.likes ?? post.likes}</span>
      </button>

      <button
        onClick={handleDislikeButton}
        className={`flex items-center space-x-2 hover:text-red-600 ${
          likeState.isUnliked ? "text-red-500" : "text-gray-600"
        }`}
      >
        <HeartOff className="w-5 h-5" />
        <span>{updatedPost?.unlikes ?? post.unlikes}</span>
      </button>
    </div>
  );
};

const CommentAndDeleteActions = ({
  post,
  currentUser,
  setOpenCommentSection,
}) => {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.post.comments[post.id] || []);
  const [openCardDelete, setOpenCardDelete] = useState(false);

  const handleDeletePost = () => {
    dispatch(deletePost({ postId: post.id })).then(() =>
      dispatch(fetchAllPosts())
    );
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => setOpenCommentSection((open) => !open)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{comments?.length || post?.comment?.length}</span>
      </button>

      {/* <button
        className={`text-gray-600 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 ${
          favourite ? "text-yellow-500 dark:text-yellow-400" : ""
        }`}
      >
        <Bookmark className={`w-5 h-5 ${favourite ? "fill-current" : ""}`} />
      </button> */}

      {currentUser?.userId === post?.userId && (
        <button
          onClick={() => setOpenCardDelete(true)}
          className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      {openCardDelete && (
        <DialogBox
          message="Do You Want To Delete The Post?"
          trigger="Delete"
          closeDialog={() => setOpenCardDelete(false)}
          onConfirm={handleDeletePost}
        />
      )}
    </div>
  );
};

const CommentOpenSection = ({ post, currentUser }) => {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.post.comments[post.id] || []);
  const [commentData, setCommentData] = useState("");

  const handleInputChange = (e) => {
    setCommentData(e.target.value);
  };

  const handleAddComment = () => {
    if (!commentData.trim()) return;
    dispatch(
      createCommentThunk({
        postId: post.id,
        commentor: currentUser.userId,
        description: commentData,
      })
    ).then(() => dispatch(fetchCommentsByPostId(post.id)));
    setCommentData("");
  };

  const handleDeleteComment = (commentId) => {
    dispatch(deleteCommentThunk({ commentId, postId: post.id })).then(() =>
      dispatch(fetchCommentsByPostId(post.id))
    );
  };

  useEffect(() => {
    dispatch(fetchCommentsByPostId(post.id));
  }, [dispatch, post.id]);

  return (
    <div className="w-full p-2 border-t dark:border-gray-700">
      <div className="flex space-x-2 mb-2">
        <textarea
          name="description"
          value={commentData}
          onChange={handleInputChange}
          className="flex-1 p-3 rounded-b-lg bg-[#1B1B1B] border dark:border-gray-700 dark:text-white"
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
        {comments.map((com) => (
          <div
            key={com.id}
            className="bg-gray-50 dark:bg-[#494F55] border border-gray-700 rounded-br-xl rounded-tl-xl p-4 shadow-sm"
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
                  onClick={() => handleDeleteComment(com.id)}
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
  const [addComment, setAddComment] = useState(false);

  useEffect(() => {}, [addComment]);

  return (
    <div className="flex flex-col items-center justify-between border-t dark:border-gray-700">
      <div className="w-full flex justify-between items-center pl-4 pr-4 py-2">
        <LikeUnlikeActions post={post} currentUser={currentUser} />
        <CommentAndDeleteActions
          post={post}
          currentUser={currentUser}
          setOpenCommentSection={setOpenCommentSection}
        />
      </div>
      {openCommentSection && (
        <CommentOpenSection
          post={post}
          currentUser={currentUser}
          isCommentAdded={setAddComment}
        />
      )}
    </div>
  );
}
