import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import { useContext, useState, useEffect } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import Card1 from "../../Components/Card1/Card1";
import DialogBox from "../../Components/DialogBox/DialogBox";
import { useNavigate, useParams } from "react-router-dom";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import FollowersCard from "../../Components/FollowersCard/FollowersCard";
import { useFetchUserById } from "../../Loaders/users/useFetchUserById";
import { useFetchPostsByUserId } from "../../Loaders/posts/useFetchPostsByUserId";

const ProfilePostHeading = ({ whatToShow, setWhatToShow, isCurrentUser }) => {
  return (
    <div className="w-full mt-5 mb-2 border border-slate-100 rounded-xl h-10 flex justify-between pr-5 items-center pl-2 dark:bg-darkPostCardBackground dark:border dark:border-gray-700">
      <div className="flex h-full justify-center items-center gap-2">
        <h1
          onClick={() => setWhatToShow((prev) => !prev)}
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
  );
};
const ProfileUserInformation = ({ currentUser, user, id }) => {
  const [showCard, setShowCard] = useState(false);
  const [logoutCard, setLogoutCard] = useState(false);

  const handleUpdateCard = () => {
    setShowCard((prev) => !prev);
  };

  return (
    <div className="w-full h-fit border-2 dark:border dark:border-gray-700 dark:bg-darkPostCardBackground  border-slate-200 shadow-md rounded-xl mb-2 pb-2 flex flex-col gap-2 justify-center md:justify-start items-start pl-5 pr-2 pt-2 mt-2">
      {currentUser && (
        <h1 className="font-bold text-slate-800 dark:text-darkBlue border-2 dark:border-none border-slate-300 px-1 py-1 rounded-md text-sm md:text-md -tracking-tighter">
          <span>{user?.userId}</span>
        </h1>
      )}
      <h1 className="font-semibold text-sm text-slate-800 dark:text-darkText ">
        Username: <span className="text-slate-500 ">{user?.username}</span>
      </h1>
      <h1 className="font-semibold text-sm  text-slate-800 dark:text-darkText">
        Email: <span className="text-slate-500 ">{user?.email}</span>
      </h1>
      <h1 className="font-semibold text-sm dark:text-darkText text-slate-800 ">
        Full Name:
        <span className="text-slate-500 ">
          {user?.fullname || (
            <span className="text-slate-400  text-xs">Not Provided</span>
          )}
        </span>
      </h1>
      <h1 className="font-bold text-sm dark:text-darkText text-slate-800  ">
        Gender:
        <span className="text-slate-500">
          {user?.gender || (
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
  );
};
const FollowingAndFollowerCard = ({
  userPosts,
  currentUser,
  totalFollowers,
  totalFollowing,
}) => {
  return (
    <div className="w-full md:w-[70%] h-full mt-[68px]">
      <div className="w-full hidden h-60 md:flex justify-between items-center">
        <FollowersCard
          key={currentUser?.userId}
          post={userPosts}
          totalFollowing={totalFollowing}
          totalFollowers={totalFollowers}
        />
      </div>
    </div>
  );
};
const ProfileUserPosts = ({ userPosts, whatToShow, loading }) => {
  return (
    <div className="w-full flex flex-wrap gap-2">
      {!whatToShow ? (
        userPosts ? (
          userPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className=" text-center min-h-[200px]"></div>
        )
      ) : (
        ""
      )}
      {!loading && <div className="text-center min-h-[500px] w-full"></div>}
    </div>
  );
};
const ProfileAvatar = ({ user }) => {
  return (
    <div className="w-full h-fit flex justify-start flex-col items-center">
      <div className="w-60 h-60 mb-4 rounded-full flex justify-center items-start">
        <img
          className="w-full h-60 object-cover dark:border-none rounded-full border-2 border-white"
          src={
            user?.avatar ||
            "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
          }
          alt="User Avatar"
        />
      </div>
      {/* <div className="w-full h-24 md:hidden flex justify-between items-center">
        <FollowersCard
          key={currentUser?.userId}
          post={userPosts}
          totalFollowing={info?.user?.followers?.length}
          totalFollowers={info?.user?.following?.length}
        />
      </div> */}
    </div>
  );
};

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loadUser } = useFetchUserById(id);
  const { currentUser } = useContext(AuthContext);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { userPosts, loadUserPosts, userPostsLoading } =
    useFetchPostsByUserId(id);
  const [reload, setReload] = useState(false);
  const [whatToShow, setWhatToShow] = useState(false);

  const isCurrentUser = user?.id === currentUser?.id;

  useEffect(() => {
    loadUser();
    loadUserPosts();
  }, [id]);

  const totalFollowers = user?.followers?.length;
  const totalFollowing = user?.following?.length;

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

  const closeDialogHandler = async (shouldDelete) => {
    setLogoutCard(false);
    if (shouldDelete) {
      await handleLogout();
    }
  };

  return (
    <div className="w-full min-h-fit md:p-1 p-2 gap-3 md:flex justify-start items-start">
      <div className="w-full md:w-[25%] rounded-3xl p-2 mt-14 lg:w-[30%] h-full flex flex-col justify-start items-start">
        <ProfileAvatar user={user} />
        <div className="w-full h-fit mb-2 flex flex-col justify-start items-start border border-slate-50 dark:border-none dark:rounded-none"></div>
        {/* {showCard && (
          <div className="w-full h-full flex flex-col p-5 border border-slate-300 rounded-2xl shadow-md mb-2 justify-start items-center">
            <UpdateCard upd={info.user} />
          </div>
        )} */}
        <ProfileUserInformation user={user} currentUser={currentUser} id={id} />
        <Card1 isCurrentUser={isCurrentUser} />
        <div className="hidden w-full h-fit md:block mt-2">
          <HotTopicsCard />
        </div>
      </div>
      <div className="md:w-[75%]">
        <FollowingAndFollowerCard
          userPosts={userPosts}
          currentUser={currentUser}
          totalFollowers={totalFollowers}
          totalFollowing={totalFollowing}
        />
        <ProfilePostHeading
          whatToShow={whatToShow}
          setWhatToShow={setWhatToShow}
          isCurrentUser={isCurrentUser}
        />
        <ProfileUserPosts
          whatToShow={whatToShow}
          userPosts={userPosts}
          loading={userPostsLoading}
        />
      </div>
    </div>
  );
}

export default Profile;
