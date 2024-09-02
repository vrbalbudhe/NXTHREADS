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
import { useNavigate } from "react-router-dom";
import { UserInfoContext } from "../../Context/UerInfoContext";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";

function Profile() {
  const {
    info,
    loading: userInfoLoading,
    fetchUserInfo,
  } = useContext(UserInfoContext);
  const {
    posts,
    fetchUserPosts,
    favPosts,
    fetchSavedPosts,
    hasMore,
    loading,
    setPage,
  } = useContext(PostContext);
  const { currentUser } = useContext(AuthContext);
  const [reload, setReload] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [logoutCard, setLogoutCard] = useState(false);
  const [favourite, setFavourite] = useState([]);
  const [whatToShow, setWhatToShow] = useState(false);

  const userInfo = currentUser?.userInfo;
  const userInformation = currentUser?.userInfo || {};
  const isCurrentUser = userInfo?.id === userInformation?.id;

  const navigate = useNavigate();
  console.log(favPosts);

  useEffect(() => {
    if (userInformation?.id) {
      fetchSavedPosts(userInformation.id);
      fetchUserPosts(userInformation.id);
    }
  }, [userInformation]);
  const handleFollowingData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/userfollow/following/${userInfo.id}`,
        {
          withCredentials: true,
        }
      );
      setTotalFollowing(res.data || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollowersData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/userfollow/followers/${userInfo.id}`,
        {
          withCredentials: true,
        }
      );
      setTotalFollowers(res.data || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
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
    <div className="w-full min-h-[500px] p-1 md:flex justify-start items-start">
      <div className="w-full md:w-[30%] rounded-3xl p-2 mt-14 lg:w-[30%] h-full flex flex-col justify-start items-start">
        <div className="w-full h-fit">
          <div className="w-full h-40 mb-4 rounded-full flex justify-center items-start">
            <img
              className="w-full h-40 object-cover rounded-lg border-2 border-white"
              src={
                info.user?.avatar ||
                userInformation.avatar ||
                "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
              }
              alt="User Avatar"
            />
          </div>

          <div className="w-full h-fit border-2 border-slate-200 shadow-md rounded-md mb-2 pb-2 flex flex-col gap-2 justify-center md:justify-start items-start pl-5 pr-2 pt-2 mt-2">
            {isCurrentUser && (
              <h1 className="font-bold text-slate-800 border-2 border-slate-300 px-1 py-1 rounded-md text-xs md:text-md -tracking-tighter">
                <span>{info?.user?.id}</span>
              </h1>
            )}
            <h1 className="font-semibold text-sm text-slate-800">
              Username:{" "}
              <span className="text-slate-500">{info?.user?.username}</span>
            </h1>
            <h1 className="font-semibold text-sm text-slate-800">
              Email: <span className="text-slate-500">{info.user?.email}</span>
            </h1>
            <h1 className="font-semibold text-sm text-slate-800">
              Full Name:
              <span className="text-slate-500">
                {info.user?.fullname || (
                  <span className="text-slate-400 text-xs">Not Provided</span>
                )}
              </span>
            </h1>
            <h1 className="font-bold text-sm text-slate-800">
              Gender:
              <span className="text-slate-500">
                {info.user?.gender || (
                  <span className="text-slate-400 font-semibold text-xs">
                    Not Provided
                  </span>
                )}
              </span>
            </h1>

            {isCurrentUser && (
              <div className="w-full h-fit flex flex-wrap justify-start items-center gap-1 mt-2">
                <button
                  onClick={handleUpdateCard}
                  className="w-[40%] bg-transparent border border-slate-400 px-2 py-1 text-xs rounded-xl hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
                >
                  Update
                </button>
                <button className="w-[40%] bg-transparent border border-slate-400 px-2 py-1 text-xs rounded-xl hover:bg-blue-400 hover:text-white text-slate-800 font-bold">
                  Feedback
                </button>
                <button
                  onClick={() => setLogoutCard(true)}
                  className="w-[40%] bg-transparent hover:bg-red-400 text-slate-800 border border-slate-400 px-2 py-1 text-xs rounded-xl hover:text-white font-bold"
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
        <div className="w-full h-fit mb-2 bg-slate-50 flex flex-col justify-start items-start border border-slate-50">
          <SocialMediaCard />
        </div>
        {showCard && (
          <div className="w-full h-full flex flex-col p-5 border border-slate-300 rounded-2xl shadow-md mb-2 justify-start items-center">
            <UpdateCard upd={info.user} />
          </div>
        )}
        <Card1 isCurrentUser={isCurrentUser} />
        <HotTopicsCard />
      </div>

      <div className="w-full md:w-[70%] h-full mt-1">
        <div className="w-full h-40 flex justify-between pr-5 items-center pl-5">
          {/* <FollowersCard key={currentUser.userInfo.id} post={posts.posts} totalFollowing={totalFollowing} totalFollowers={totalFollowers} /> */}
        </div>
        <div className="w-full mt-8 border border-slate-100 rounded-sm h-10 flex justify-between pr-5 items-center pl-2">
          <div className="flex h-full justify-center items-center gap-2">
            <h1
              onClick={() => setWhatToShow(!whatToShow)}
              className={`${!whatToShow ? "bg-black text-white" : ""} font-semibold text-xs cursor-pointer rounded-sm px-2 py-1 -tracking-tighter text-slate-800`}
            >
              My Blogs
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
            posts.length > 0 ? (
              posts.map(
                (post) =>
                  post.author === currentUser.userInfo.username && (
                    <PostCard key={post.id} post={post} />
                  )
              )
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
          {loading && (
            <div>
              <img
                src="https://www.icegif.com/wp-content/uploads/2023/07/icegif-1263.gif"
                alt=""
              />
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
