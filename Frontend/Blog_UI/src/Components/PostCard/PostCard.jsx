/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useLoaderData, useNavigate } from "react-router-dom";
import { CiMenuKebab } from "react-icons/ci";
import { RiDeleteBin3Line } from "react-icons/ri";
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

function PostCard({ post }) {
  const { userInfoResponse, homepageAllPosts } = useLoaderData();
  const { currentUser } = useContext(AuthContext);
  const [favourite, setFavourite] = useState(false);
  const [cardDelete, setCardDelete] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const navigate = useNavigate();
  const [isdropdown, setIsDropDown] = useState(false);

  useEffect(() => {
    if (userInfoResponse?.data) {
      const isLiked = userInfoResponse.data.user.savedPosts.some(
        (savedPost) => savedPost.postId === post.id
      );
      setFavourite(isLiked);
    }
    if (homepageAllPosts?.data) {
      const isLiked = homepageAllPosts.data.posts.some((p) => p.id === post.id);
      setFavourite(isLiked);
    }
  }, [userInfoResponse, homepageAllPosts, post.id]);

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
      console.error("Error updating favourite status:", error);
    }
  };

  const handleDeleteBlog = async () => {
    if (!currentUser?.userInfo?.id) {
      console.error("No user info available.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/post/${post.id}`, {
        withCredentials: true,
      });
      navigate(`/profile/${currentUser.userInfo.id}`);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const closeDialogHandler = (shouldDelete) => {
    setCardDelete(false);
    if (shouldDelete) {
      handleDeleteBlog();
    }
  };

  const handleDropDownMenu = (e) => {
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

  return (
    <div className="w-full h-fit border mt-2 hover:border-slate-300 rounded-lg duration-300 border-slate-300 bg-white hover:shadow-md">
      <div className="w-full h-10 flex justify-between items-center pl-5 bg-gradient-to-r from-zinc-100 to-slate-50 rounded-t-lg">
        <h1 className="font-bold text-sm text-slate-900">{post.title}</h1>
        <div className="w-fit h-full flex justify-end items-center">
          <div
            onClick={() => {
              setLike((prev) => !prev);
              setDislike(false);
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
          {cardDelete && <DialogBox message={"Do you want to delete the post?"} closeDialog={closeDialogHandler} trigger={"Delete"} />}

          {currentUser?.userInfo?.id === post.userId ? (
            <div
              onClick={() => setCardDelete(true)}
              className="hover:text-slate-500 w-fit text-slate-900 font-semibold p-2 h-full flex items-center text-xl"
            >
              <RiDeleteBin3Line />
            </div>
          ) : null}
          <div
            onClick={(e) => {
              handleDropDownMenu();
            }}
            className="hover:text-slate-500 w-fit text-slate-900 font-semibold p-2 h-full flex items-center"
          >
            <CiMenuKebab />
          </div>
          {isdropdown && (
            <div className="dropdown-menu h-fit bg-slate-50 ml-20 absolute right-6 mt-12 w-32 border border-gray-400 rounded-lg shadow-lg z-10">
              <ul className=" pl-3 pr-3 pt-2 pb-2 text-sm flex flex-col justify-center items-center">
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
      <div className="w-full h-10 flex justify-start pl-5 items-center">
        <h1 className="font-bold text-xs text-red-500 cursor-pointer hover:text-slate-600 underline -tracking-tight">
          {post.subtitle}
        </h1>
      </div>
      <div className="w-full h-fit p-5 flex justify-start items-center">
        <p className="text-slate-700 leading-relaxed text-[13px] font-[Poppins]">
          {post.content}
        </p>
      </div>

      {post.images && showSlider ? (
        <Slider post={post} onClose={() => setShowSlider(false)} />
      ) : (
        post.images?.length > 0 && (
          <div
            onClick={() => setShowSlider(true)}
            className="w-full h-fit text-center object-contain flex flex-col gap-2 justify-start p-5 items-center cursor-pointer"
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
      <div className="w-full h-10 flex justify-start pl-5 items-center">
        <span
          onClick={() => navigate(`/list?category=${post.category}&author=`)}
          className="text-white font-bold bg-slate-900 hover:bg-slate-800 hover:text-blue-400 cursor-pointer text-xs px-2 py-1 rounded-md"
        >
          #{post.category}
        </span>
      </div>
      <div className="w-full h-10 flex justify-between items-center px-5 py-3 bg-white rounded-b-xl">
        <div className="flex items-center">
          <img
            className="w-6 h-6 rounded-full mr-2 border border-slate-500"
            src="https://via.placeholder.com/150"
            alt="avatar"
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
    </div>
  );
}
//
export default PostCard;
