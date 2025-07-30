import axios from "axios";
import { Pencil } from "lucide-react";
import { AuthContext } from "../Context/AuthContext";
import { useContext, useState, useEffect } from "react";
import PostCard from "../Components/PostCard/PostCard";
import BlogWriteBanner from "../Components/UI_Components/BlogWriteBanner";
import { useNavigate, useParams } from "react-router-dom";
import HotTopicsCard from "../Components/UI_Components/HotTopicsCard";
import FollowersCard from "../Components/FollowersCard/FollowersCard";
import { useFetchUserById } from "../Loaders/users/useFetchUserById";
import { useFetchPostsByUserId } from "../Loaders/posts/useFetchPostsByUserId";
import CompleteProfileCard from "../Components/UI_Components/CompleteProfileCard";
import UpdateCard from "../Components/LayoutComponents/UpdateCard";
import { X } from "lucide-react";

const ProfilePostHeading = ({ whatToShow, setWhatToShow, isCurrentUser }) => {
  return (
    <div className="w-full mt-2 md:mt-5 mb-2 border border-slate-300 rounded-2xl h-10 flex justify-between pr-1 items-center pl-2 dark:bg-darkPostCardBackground dark:border dark:border-gray-700">
      <div className="flex h-full justify-center items-center gap-2">
        <h1
          className={`${!whatToShow ? " text-slate-800" : ""} font-semibold text-sm cursor-pointer rounded-sm px-2 py-1 -tracking-tighter dark:text-white`}
        >
          My Blogs
        </h1>
      </div>
      {isCurrentUser && (
        <button
          onClick={() => navigate("/createBlog")}
          className="bg-darkPostCardBackground border border-gray-700 px-3 py-1 text-sm rounded-2xl text-white font-bold"
        >
          Create Blog
        </button>
      )}
    </div>
  );
};
const ProfileUserInformation = ({
  currentUser,
  user,
  id,
  setShowUpdateCard,
}) => {
  return (
    <div className="w-full h-fit select-none border border-slate-300 dark:border-gray-700 bg-white dark:bg-darkPostCardBackground rounded-2xl p-5 shadow-sm transition-all">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400">Username</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-darkText">
            {user?.username || (
              <span className="text-xs text-slate-400">Not Provided</span>
            )}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400">Email</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-darkText">
            {user?.email || (
              <span className="text-xs text-slate-400">Not Provided</span>
            )}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400">Full Name</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-darkText">
            {user?.fullname || (
              <span className="text-xs text-slate-400">Not Provided</span>
            )}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400">Gender</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-darkText">
            {user?.gender || (
              <span className="text-xs text-slate-400">Not Provided</span>
            )}
          </span>
        </div>
      </div>

      {currentUser && (
        <button
          onClick={() => setShowUpdateCard(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-slate-300 dark:border-gray-600 text-slate-800 dark:text-white font-semibold text-sm py-2 px-4 rounded-xl hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
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
    <div className="w-full md:w-[70%] h-full md:mt-[68px]">
      <div className="w-full h-32 md:h-60 md:flex justify-between items-center">
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
const ProfileUserPosts = ({ userPosts, whatToShow, loading, currentUser }) => {
  return (
    <div className="w-full flex flex-wrap gap-2">
      {!whatToShow ? (
        userPosts ? (
          userPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))
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
    <div className="w-full h-fit flex justify-start flex-col items-center select-none pointer-events-none">
      <div className=" w-full md:mb-4 rounded-full flex justify-start md:justify-center items-start">
        <img
          className="w-full h-44 md:w-60 md:h-60 object-cover dark:border-none rounded-xl md:rounded-full border-2 border-white"
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
  const [showUpdateCard, setShowUpdateCard] = useState(false);

  const isCurrentUser = user?.id === currentUser?.userId;

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
    <div className="w-full min-h-fit md:p-1 p-2 md:gap-2 md:flex justify-start items-start">
      <div className="w-full md:w-[25%] rounded-3xl md:p-2 md:mt-14 lg:w-[30%] gap-2 h-full flex flex-col justify-start items-start">
        <ProfileAvatar user={user} />
        <div className="w-full block md:hidden select-none pointer-events-none">
          <FollowingAndFollowerCard
            userPosts={userPosts}
            currentUser={currentUser}
            totalFollowers={totalFollowers}
            totalFollowing={totalFollowing}
          />
        </div>
        {currentUser?.userId === id && (
          <CompleteProfileCard currentUser={currentUser} />
        )}

        <ProfileUserInformation
          user={user}
          currentUser={currentUser}
          id={id}
          setShowUpdateCard={setShowUpdateCard}
        />
        <div className="w-full hidden md:block">
          <BlogWriteBanner isCurrentUser={isCurrentUser} />
        </div>
        <div className="hidden w-full h-fit md:block">
          <HotTopicsCard />
        </div>
      </div>
      <div className="md:w-[75%]">
        <div className="hidden md:block">
          <FollowingAndFollowerCard
            userPosts={userPosts}
            currentUser={currentUser}
            totalFollowers={totalFollowers}
            totalFollowing={totalFollowing}
          />
        </div>
        <ProfilePostHeading
          whatToShow={whatToShow}
          setWhatToShow={setWhatToShow}
          isCurrentUser={isCurrentUser}
        />
        <ProfileUserPosts
          whatToShow={whatToShow}
          userPosts={userPosts}
          currentUser={currentUser}
          loading={userPostsLoading}
        />
      </div>
      {showUpdateCard && (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="w-full max-w-md">
            <UpdateCard upd={user} />
            <div className="w-full flex justify-center mt-2">
              <button
                onClick={() => setShowUpdateCard(false)}
                className="text-sm flex justify-center items-center gap-2 bg-white px-2 py-1 rounded-md text-slate-700 hover:text-red-500"
              >
                <X size={16} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
