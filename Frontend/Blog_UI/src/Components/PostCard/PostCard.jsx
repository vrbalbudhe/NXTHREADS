/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CiMenuKebab } from "react-icons/ci";
import { RiDeleteBin3Line } from "react-icons/ri";
import { LiaComments } from "react-icons/lia";
import {
  BiLike,
  BiDislike,
  BiSolidLike,
  BiSolidDislike,
  BiAddToQueue,
  BiSolidAddToQueue,
} from "react-icons/bi";
import Slider from "../Slider/Slider";
import DialogBox from "../DialogBox/DialogBox";
import { PostContext } from "../../Context/PostContext";
import { CommentContext } from "../../Context/CommentContext";
import { LikeContext } from "../../Context/LikeContext";

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

  const { likes, setLikes, toggleLike, loading, error, toggleUnLike } =
    useContext(LikeContext);
  const { HandleDeleteBlog } = useContext(PostContext);
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments(post.id);
    setCurrentPostId(post.id);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddComment = async () => {
    console.log(commentData.description);
    console.log(post.id);
    await addComment(commentData.description, post.id);
    setCommentData({ description: "" });
    console.log(info);
  };

  // console.log(post);

  const handleLikeButton = () => {
    toggleLike(post.id, currentUser?.userInfo?.id);
  };

  const handleDislikeButton = () => {
    toggleUnLike(post?.id, currentUser?.userInfo?.id);
  };

  const handleFavouriteSwitch = async () => {
    if (!currentUser?.userInfo?.id) {
      console.error("No user info available.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/post/fav",
        {
          userId: currentUser.userInfo.id,
          postId: post.id,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(res.data.message);
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
      await axios.delete(
        `http://localhost:8000/api/comment/delete/${deleteCommentId}`,
        { withCredentials: true }
      );
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

  const handleDropDownMenu = () => {
    setIsDropDown(!isdropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu")) {
        setIsDropDown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // console.log(comments);

  return (
    <div className="w-full h-fit border-2 mt-1 hover:border-slate-200 rounded-lg duration-300 border-zinc-200 bg-white hover:shadow-lg">
      <div className="w-full h-10 flex justify-between items-center pl-5 bg-gradient-to-r from-zinc-50 to-slate-50 rounded-t-lg">
        <h1 className="font-bold text-sm text-slate-900">{post.title}</h1>
        <div className="w-fit h-full flex justify-end items-center">
          <div
            onClick={() => {
              setLike((prev) => !prev);
              setDislike(false);
              handleLikeButton();
            }}
            className="hover:text-slate-500 w-fit text-2xl text-slate-900 font-semibold p-2 h-full flex items-center"
            aria-label={like ? "Unlike post" : "Like post"}
          >
            {like ? <BiSolidLike /> : <BiLike />}
          </div>
          <div
            onClick={() => {
              setDislike((prev) => !prev);
              setLike(false);
              handleDislikeButton();
            }}
            className="hover:text-slate-500 w-fit text-2xl text-slate-900 font-semibold p-2 h-full flex items-center"
            aria-label={dislike ? "Undislike post" : "Dislike post"}
          >
            {dislike ? <BiSolidDislike /> : <BiDislike />}
          </div>
          <button
            onClick={handleFavouriteSwitch}
            className="h-full w-fit text-2xl flex p-2 justify-center items-center pr-2 font-bold text-red-400"
            aria-label={
              favourite ? "Remove from favourites" : "Add to favourites"
            }
          >
            {favourite ? <BiSolidAddToQueue /> : <BiAddToQueue />}
          </button>
          {cardDelete && (
            <DialogBox
              message={"Do you want to delete the post?"}
              closeDialog={closeDialogHandler}
              trigger={"Delete"}
            />
          )}
          {currentUser?.userInfo?.id === post.userId && (
            <div
              onClick={() => setCardDelete(true)}
              className="hover:text-slate-500 w-fit text-slate-900 font-semibold p-2 h-full flex items-center text-xl"
            >
              <RiDeleteBin3Line />
            </div>
          )}
          <div
            onClick={handleDropDownMenu}
            className="hover:text-slate-500 w-fit text-slate-900 font-semibold p-2 h-full flex items-center"
          >
            <CiMenuKebab />
          </div>
          {isdropdown && (
            <div className="dropdown-menu h-fit bg-slate-50 ml-20 absolute right-6 mt-12 w-32 border border-gray-400 rounded-lg shadow-lg z-10">
              <ul className="pl-3 pr-3 pt-2 pb-2 text-sm flex flex-col justify-center items-center">
                <li className="w-full cursor-pointer hover:bg-slate-200 h-6 border-b-2 border-slate-300">
                  Report
                </li>
                <li className="w-full cursor-pointer hover:bg-slate-200 h-6 border-b-2 border-slate-300">
                  Block
                </li>
                <li className="w-full cursor-pointer hover:bg-slate-200 h-6">
                  About
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="w-full min-h-8 flex bg-zinc-200 justify-start pl-5 items-center">
        <h1 className="font-bold text-xs text-slate-900 cursor-pointer hover:text-orange-400 underline -tracking-tight">
          {post.subtitle}
        </h1>
      </div>
      <div className="w-full h-fit p-5 flex flex-wrap justify-start items-center">
        <p className="text-slate-700 flex-wrap overflow-hidden leading-relaxed text-[13px] font-[Poppins] break-words">
          {post.content}
        </p>
      </div>

      {post.images && showSlider ? (
        <Slider post={post} onClose={() => setShowSlider(false)} />
      ) : (
        post.images?.length > 0 && (
          <div
            onClick={() => setShowSlider(true)}
            className="w-full h-fit text-center object-contain flex flex-col gap-2 justify-start p-2 items-center cursor-pointer"
          >
            {post.images.map((image, index) =>
              image.endsWith("mp4") ? (
                <video
                  key={`${post.id}-${index}`}
                  src={image}
                  title={`video-${index}`}
                  width="640"
                  height="400"
                  controls
                  className="w-full h-72 rounded-lg border border-slate-300 shadow-md"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  key={`${post.id}-${index}`}
                  src={image}
                  alt={`Content-Id::${post.id}::image ${index}`}
                  className="w-full h-full rounded-sm"
                />
              )
            )}
          </div>
        )
      )}
      <div className="w-full h-10 flex justify-start pl-3 items-center">
        <span
          onClick={() => navigate(`/list?category=${post.category}&author=`)}
          className="text-white font-bold hover:text-blue-400 bg-slate-950 cursor-pointer text-xs px-2 py-1 rounded-sm"
        >
          #{post.category}
        </span>
      </div>
      <div className="w-full h-10 flex justify-between items-center px-5 py-3 bg-white rounded-b-xl">
        <div className="flex items-center">
          <img
            className="w-6 h-6 object-cover rounded-full mr-2 border border-slate-500"
            src={
              post?.User?.avatar ||
              "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"
            }
            alt={post.author}
          />
          <span className="text-xs text-slate-700 font-bold">
            {post.author}
          </span>
        </div>
        <div className="text-xs flex gap-5 text-slate-600">
          <h1>
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </h1>
          <h1>
            {new Date(post.createdAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </h1>
        </div>
      </div>
      <div className="w-full h-12 flex justify-start items-center pl-5">
        <LiaComments
          onClick={() => setCommentBtn((prev) => !prev)}
          className="text-2xl cursor-pointer text-slate-600"
        />
        <h1 className="font-semibold text-slate-700 text-sm ml-2">Comments</h1>
      </div>
      {commentBtn && (
        <div className="w-full h-fit flex flex-col justify-center items-center pl-2 pr-2">
          <div className="w-full h-fit flex justify-center items-center gap-2 mb-5">
            <textarea
              name="description"
              value={comments.description}
              onChange={handleInputChange}
              className="w-[90%] h-14 rounded-md p-2 border border-slate-300"
              placeholder="Add a comment..."
            />
            <button
              onClick={handleAddComment}
              className="w-[10%] text-sm py-1 bg-blue-500 text-white rounded-2xl hover:bg-blue-600"
            >
              Comment
            </button>
          </div>
          <div className="w-full min-h-5 mb-2 flex flex-col justify-center items-center gap-2">
            {post.comment.map((com) => (
              <div
                key={com.id}
                className="w-full min-h-14 bg-slate-100 border border-slate-200 shadow-sm flex flex-col p-2"
              >
                {/* Comment Header: Avatar and Username */}
                <div className="w-full flex items-center mb-2">
                  <div className="flex items-center w-[50%]">
                    <img
                      className="w-8 h-8 object-cover rounded-full mr-2"
                      src={
                        com?.user?.avatar ||
                        "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"
                      }
                      alt="User Avatar"
                    />
                    <h1 className="text-slate-800 text-xs font-semibold">
                      {com?.user?.fullname}{" "}
                      <span className="text-xs text-slate-400 cursor-pointer">
                        {com?.user?.username}
                      </span>
                    </h1>
                  </div>

                  {/* Delete Icon (conditionally displayed) */}
                  {com.commentor === currentUser?.userInfo?.id && (
                    <button
                      onClick={() => {
                        setCommentDelete(true);
                        setDeleteCommentId(com._id);
                      }}
                      className="ml-auto text-slate-800 text-xl"
                    >
                      <RiDeleteBin3Line />
                    </button>
                  )}
                </div>

                {/* Comment Body */}
                <div className="w-full text-xs text-slate-800">
                  {com.description}
                </div>

                {/* Delete Confirmation Dialog */}
                {commentDelete && (
                  <DialogBox
                    message="Do you want to delete the comment?"
                    closeDialog={handlecommentDelete}
                    trigger="Delete"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
