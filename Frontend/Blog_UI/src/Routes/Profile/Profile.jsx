/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { PiTagFill } from "react-icons/pi";
import { AuthContext } from "../../Context/AuthContext";
import { TiHeartFullOutline } from "react-icons/ti";
import { Await, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useContext, useState, useEffect } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import UpdateCard from "../../Components/UpdateCard/UpdateCard";
import FollowersCard from "../../Components/FollowersCard/FollowersCard";
import SocialMediaCard from "../../Components/SocialMediaCard/SocialMediaCard";
import Card1 from "../../Components/Card1/Card1";
import DialogBox from "../../Components/DialogBox/DialogBox";

function Profile() {
  const { postResponse, userInfoResponse } = useLoaderData();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [reload, setReload] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [logoutCard, setLogoutCard] = useState(false);
  const [favourite, setFavourite] = useState([]);
  const [whatToShow, setWhatToShow] = useState(false);

  const userInfo = currentUser?.userInfo;
  const userInformation = userInfoResponse?.data?.user || {};
  const isCurrentUser = userInfo?.id === userInformation?.id;
  useEffect(() => {
    handleFollowingData();
    handleFollowersData();
    handleSavedPosts();
  }, [
    currentUser,
    postResponse,
    favourite,
    userInfoResponse,
    navigate,
    reload,
  ]);

  const handleFollowingData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/userfollow/following/${userInformation.id}`,
        { withCredentials: true }
      );
      setTotalFollowing(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSavedPosts = async () => {
    const id = currentUser.userInfo.id;
    try {
      const res = await axios.get(`http://localhost:8000/api/post/fav/${id}`, {
        withCredentials: true,
      });
      setFavourite(res.data.posts);
      // console.log(res.data.posts);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollowersData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/userfollow/followers/${userInformation.id}`,
        { withCredentials: true }
      );
      setTotalFollowers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    // e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("user");
      setReload((prev) => !prev); // Toggle the reload state
      navigate("/login"); // Redirect to the login page
      window.location.reload();
    } catch (error) {
      console.log(error);
      navigate("/profile"); // Redirect to profile if there's an error
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

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (!userInformation || !userInfo) {
    navigate("/login");
    return null;
  }

  return (
    <div className="w-full min-h-[500px] md:flex justify-start items-start gap-1">
      <Suspense fallback={<div>Loading user information...</div>}>
        <Await resolve={userInformation} errorElement={<div>Error</div>}>
          <>
            <div className="w-full md:w-[40%] rounded-3xl p-5 mt-10 lg:w-[30%] h-full flex flex-col justify-start items-start">
              <div className="w-full h-fit">
                <div className="w-full h-44 rounded-full flex justify-center items-start">
                  <img
                    className="w-40 h-40 object-cover border-slate-100 rounded-full"
                    src={
                      userInformation.avatar ||
                      "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
                    }
                    alt="User Avatar"
                  />
                </div>

                <div className="w-full h-fit border border-slate-300 shadow-md rounded-xl mb-5 pb-5 flex flex-col gap-2 justify-center md:justify-start items-start pl-5 pr-5 pt-5">
                  {isCurrentUser && (
                    <>
                      {" "}
                      <h1
                        className={`${isCurrentUser ? "" : "hidden"} font-bold text-slate-800 border-2 border-slate-300  px-1 py-1 rounded-md text-xs md:text-md -tracking-tighter`}
                      >
                        <span className="">{userInformation.id}</span>
                      </h1>
                    </>
                  )}
                  <h1 className="font-semibold text-sm text-slate-800">
                    Username :{" "}
                    <span className="text-slate-500">
                      {userInformation.username}
                    </span>
                  </h1>
                  <h1 className="font-semibold text-sm text-slate-800">
                    Email :{" "}
                    <span className="text-slate-500">
                      {userInformation.email}
                    </span>
                  </h1>
                  <h1 className="font-semibold text-sm text-slate-800">
                    Full Name :
                    <span className="text-slate-500">
                      {userInformation.fullname || (
                        <span className="text-slate-400 text-xs">
                          Not Provided
                        </span>
                      )}
                    </span>
                  </h1>
                  <h1 className="font-bold text-sm text-slate-800">
                    Gender :
                    <span className="text-slate-500">
                      {userInformation.gender || (
                        <span className="text-slate-400 font-semibold text-xs">
                          Not Provided
                        </span>
                      )}
                    </span>
                  </h1>

                  {isCurrentUser && (
                    <div className="w-full h-fit flex flex-wrap justify-start items-center gap-1 mt-5 mb-5">
                      <button
                        onClick={handleUpdateCard}
                        className="w-[40%] bg-transparent border border-slate-400 px-2 py-1 text-xs rounded-xl hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
                      >
                        Update
                      </button>
                      <button className="w-[40%] bg-transparent border border-slate-400 px-2 py-1 text-xs rounded-xl hover:bg-blue-400 hover:text-white text-slate-800 font-bold">
                        Feedback
                      </button>
                      {/* <button
                        onClick={() => setWhatToShow(!whatToShow)}
                        className="w-[40%] bg-transparent flex justify-center gap-2 border border-slate-400 px-2 py-1 text-xs rounded-xl hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
                      >
                        Favourite{" "}
                        <span className="inline text-lg">
                          <PiTagFill />
                        </span>
                      </button> */}
                      <button
                        onClick={() => setLogoutCard(true)}
                        // onClick={handleLogout}
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
              <div className="w-full h-fit mb-5 bg-slate-50 flex flex-col justify-start items-start border border-slate-50">
                <SocialMediaCard />
              </div>
              {showCard && (
                <div className="w-full h-full flex flex-col p-5 border border-slate-300 rounded-2xl shadow-md mb-2 justify-start items-center">
                  <UpdateCard upd={userInfoResponse} />
                </div>
              )}
              <Card1 isCurrentUser={isCurrentUser} />
            </div>
          </>
        </Await>
      </Suspense>

      <div className="w-full md:w-[70%] h-full mt-10">
        <div className="w-full h-40 flex justify-between pr-5 items-center pl-5">
          <FollowersCard
            key={postResponse.id}
            post={postResponse}
            totalFollowing={totalFollowing}
            totalFollowers={totalFollowers}
          />
        </div>
        <div className="w-full mt-8 border border-slate-300 shadow-md rounded-md h-10 flex justify-between pr-5 items-center pl-2">
          <div className="flex h-full justify-center items-center gap-2">
            <h1
              onClick={() => {
                if (whatToShow === false) {
                  setWhatToShow(whatToShow);
                } else {
                  setWhatToShow(!whatToShow);
                }
              }}
              className={`hover:text-white ${!whatToShow ? "bg-blue-400 text-white" : " "} hover:bg-blue-400 font-semibold text-xs cursor-pointer border border-slate-400 rounded-md px-2 py-1 -tracking-tighter text-slate-800`}
            >
              My Blogs
            </h1>

            {isCurrentUser && (
              <h1
                onClick={() => {
                  if (whatToShow === true) {
                    setWhatToShow(whatToShow);
                    handleSavedPosts();
                  } else {
                    setWhatToShow(!whatToShow);
                  }
                }}
                className={`hover:text-white ${whatToShow ? "bg-blue-400 text-white" : " "} hover:bg-blue-400 font-semibold text-xs cursor-pointer border border-slate-400 rounded-md px-2 py-1 -tracking-tighter text-slate-800`}
              >
                Favourite
              </h1>
            )}
          </div>
          {isCurrentUser && (
            <button
              onClick={() => navigate("/createBlog")}
              className="bg-white border border-slate-400 px-3 py-1 text-xs rounded-lg hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
            >
              Create Blog
            </button>
          )}
        </div>

        {!whatToShow ? (
          <Suspense fallback={<p>Loading posts...</p>}>
            <Await
              resolve={postResponse}
              errorElement={
                <div className="w-full min-h-[400px] flex flex-col justify-center items-center">
                  <img
                    className="w-fit h-20"
                    src="https://www.icegif.com/wp-content/uploads/2023/07/icegif-1263.gif"
                    alt=""
                  />
                  <h1>Error loading Posts !.. Kindly Re-Login</h1>
                </div>
              }
            >
              {({ data }) =>
                data.posts.map((post) => <PostCard key={post.id} post={post} />)
              }
            </Await>
          </Suspense>
        ) : (
          <div>
            {favourite.length === 0 ? (
              <div>No Favorite posts found</div>
            ) : (
              favourite.map((post, index) => (
                <PostCard key={post.id} post={post.post} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
