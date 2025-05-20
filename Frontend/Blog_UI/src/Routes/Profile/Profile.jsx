/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import { PostContext } from "../../Context/PostContext";
import { useContext, useState, useEffect } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import UpdateCard from "../../Components/UpdateCard/UpdateCard";
import SocialMediaCard from "../../Components/SocialMediaCard/SocialMediaCard";
import Card1 from "../../Components/Card1/Card1";
import DialogBox from "../../Components/DialogBox/DialogBox";
import { useNavigate, useParams } from "react-router-dom";
import { UserInfoContext } from "../../Context/UerInfoContext";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import FollowersCard from "../../Components/FollowersCard/FollowersCard";

function Profile() {
  const {
    info,
    loading: userInfoLoading,
    fetchUserInfo,
  } = useContext(UserInfoContext);
  const { id } = useParams();
  console.log(id);
  const {
    posts,
    fetchUserPosts,
    favPosts,
    userPosts,
    fetchSavedPosts,
    hasMore,
    loading,
    setPage,
  } = useContext(PostContext);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { currentUser } = useContext(AuthContext);
  const [reload, setReload] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [logoutCard, setLogoutCard] = useState(false);
  const [favourite, setFavourite] = useState([]);
  const [whatToShow, setWhatToShow] = useState(false);

  const userInformation = currentUser?.userInfo || {};
  const isCurrentUser = info?.user?.id === userInformation?.id;

  const navigate = useNavigate();
  console.log(favPosts);

  useEffect(() => {
    const loadData = async () => {
      await fetchSavedPosts(id);
      await fetchUserPosts(id);
      await fetchUserInfo(id);
      await handleFollowersData();
      await handleFollowingData();
    };
    loadData();
  }, [id]);
  const handleFollowingData = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/userfollow/following/${currentUser?.userId}`,
        {
          withCredentials: true,
        }
      );
      setTotalFollowing(res?.data?.totalFollowings?.length || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollowersData = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/userfollow/followers/${currentUser?.userId}`,
        {
          withCredentials: true,
        }
      );
      setTotalFollowers(res?.data?.totalFollowers?.length || 0);
      // console.log(res.data.totalFollowers.length);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${baseUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("user");
      setReload((prev) => !prev);
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.log(error);
      navigate("/profile");
    }
  };

  const handleUpdateCard = () => {
    setShowCard((prev) => !prev);
  };

  const closeDialogHandler = async (shouldDelete) => {
    setLogoutCard(false);
    if (shouldDelete) {
      await handleLogout();
    }
  };

  return (
    <div className="w-full min-h-fit p-1 gap-3 md:flex justify-start items-start">
      <div className="w-full md:w-[30%] rounded-3xl p-2 mt-14 lg:w-[30%] h-full flex flex-col justify-start items-start">
        <div className="w-full h-fit flex justify-start flex-col items-center">
          <div className="w-60 h-60 mb-4 rounded-full flex justify-center items-start">
            <img
              className="w-full h-60 object-cover dark:border-none rounded-full border-2 border-white"
              src={
                info.user?.avatar ||
                "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
              }
              alt="User Avatar"
            />
          </div>
          <div className="w-full h-24 md:hidden flex justify-between items-center">
            <FollowersCard
              key={currentUser?.userId}
              post={userPosts}
              totalFollowing={info?.user?.followers?.length}
              totalFollowers={info?.user?.following?.length}
            />
          </div>

          <div className="w-full h-fit border-2 dark:border dark:border-none dark:bg-gray-800 border-slate-200 shadow-md rounded-xl mb-2 pb-2 flex flex-col gap-2 justify-center md:justify-start items-start pl-5 pr-2 pt-2 mt-2">
            {currentUser && (
              <h1 className="font-bold text-slate-800 dark:text-darkBlue border-2 dark:border-none border-slate-300 px-1 py-1 rounded-md text-sm md:text-md -tracking-tighter">
                <span>{info.user?.userId}</span>
              </h1>
            )}
            <h1 className="font-semibold text-sm text-slate-800 dark:text-darkText ">
              Username:{" "}
              <span className="text-slate-500 ">{info.user?.username}</span>
            </h1>
            <h1 className="font-semibold text-sm  text-slate-800 dark:text-darkText">
              Email: <span className="text-slate-500 ">{info.user?.email}</span>
            </h1>
            <h1 className="font-semibold text-sm dark:text-darkText text-slate-800 ">
              Full Name:
              <span className="text-slate-500 ">
                {info.user?.fullname || (
                  <span className="text-slate-400  text-xs">Not Provided</span>
                )}
              </span>
            </h1>
            <h1 className="font-bold text-sm dark:text-darkText text-slate-800  ">
              Gender:
              <span className="text-slate-500">
                {info.user?.gender || (
                  <span className="text-slate-400  font-semibold text-xs">
                    Not Provided
                  </span>
                )}
              </span>
            </h1>

            {currentUser.userId === id && (
              <div className="w-full h-fit flex flex-wrap justify-start items-center gap-1 mt-2">
                <button
                  onClick={handleUpdateCard}
                  className="w-[40%] bg-transparent border dark:text-darkText border-slate-400 px-2 py-2 text-xs rounded-xl hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
                >
                  Update
                </button>
                <button className="w-[40%] bg-transparent border border-slate-400 dark:text-darkText px-2 py-2 text-xs rounded-xl hover:bg-blue-400 hover:text-white text-slate-800 font-bold">
                  Feedback
                </button>
                <button
                  onClick={() => setLogoutCard(true)}
                  className="w-[40%] bg-transparent hover:bg-red-400 text-slate-800 border border-slate-400 px-2 py-2 text-xs rounded-xl dark:text-darkText hover:text-white font-bold"
                >
                  Logout
                </button>
                {logoutCard && (
                  <DialogBox
                    message={"Do you want to logout?"}
                    closeDialog={closeDialogHandler}
                    trigger={"Logout"}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-fit mb-2 flex flex-col justify-start items-start border border-slate-50 dark:border-none dark:rounded-none">
          <SocialMediaCard />
        </div>
        {showCard && (
          <div className="w-full h-full flex flex-col p-5 border border-slate-300 rounded-2xl shadow-md mb-2 justify-start items-center">
            <UpdateCard upd={info.user} />
          </div>
        )}
        <Card1 isCurrentUser={isCurrentUser} />
        <div className="hidden w-full h-fit md:block">
          <HotTopicsCard />
        </div>
      </div>

      <div className="w-full md:w-[70%] h-full mt-[68px]">
        <div className="w-full hidden h-60 md:flex justify-between items-center">
          <FollowersCard
            key={currentUser?.userId}
            post={userPosts}
            totalFollowing={info?.user?.followers?.length}
            totalFollowers={info?.user?.following?.length}
          />
        </div>
        <div className="w-full mt-5 mb-2 border border-slate-100 rounded-xl h-10 flex justify-between pr-5 items-center pl-2 dark:bg-[#01161e] dark:border dark:border-slate-800">
          <div className="flex h-full justify-center items-center gap-2">
            <h1
              onClick={() => setWhatToShow(!whatToShow)}
              className={`${!whatToShow ? " text-slate-800" : ""} font-semibold text-sm cursor-pointer rounded-sm px-2 py-1 -tracking-tighter text-white`}
            >
              My Blogs / Saved
            </h1>

            {isCurrentUser && (
              <h1
                onClick={() => {
                  setWhatToShow(!whatToShow);
                }}
                className={`${whatToShow ? "bg-black text-white" : ""} font-semibold text-xs cursor-pointer rounded-sm px-2 py-1 -tracking-tighter text-slate-800`}
              >
                Favourite
              </h1>
            )}
          </div>
          {isCurrentUser && (
            <button
              onClick={() => navigate("/createBlog")}
              className="bg-black px-3 py-1 text-xs rounded-sm text-white font-bold"
            >
              Create Blog
            </button>
          )}
        </div>

        <div>
          {!whatToShow ? (
            userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className=" text-center min-h-[200px]"></div>
            )
          ) : (
            <div>
              {favPosts.length === 0 ? (
                <div>No Favorite posts found</div>
              ) : (
                favPosts.map((post) => (
                  <PostCard key={post.post.id} post={post.post} />
                ))
              )}
            </div>
          )}
          {!hasMore && !loading && (
            <div className="text-center min-h-[500px] w-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
