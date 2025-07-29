import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import {
  Home,
  Search,
  Users,
  Info,
  Sun,
  Moon,
  MessageSquare,
  PenSquare,
  ChevronDown,
  User2,
  LogOutIcon,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import MobileNavbar from "./MobileNavbar";
import DarkToggleButton from "./DarkToggleButton";

const Api = `${import.meta.env.VITE_API_BASE_URL}/api`;

const NavbarLogo = () => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/")}
      className="flex items-center space-x-2 select-none"
    >
      <img
        className="w-8 h-8 text-white rounded-full object-cover"
        src="/chat_darkmode.png"
        alt="Logo"
      />
      <h1 className="text-md font-medium text-gray-800 dark:text-white cursor-pointer">
        NXTHREADS
      </h1>
    </div>
  );
};

const NavbarNavigationTray = ({ currentUser }) => {
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      path: "/",
      showAlways: true,
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: "Search",
      path: "/search",
      showAlways: true,
    },
    {
      icon: <PenSquare className="w-5 h-5" />,
      label: "Create",
      path: "/createBlog",
      showLoggedIn: true,
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Bloggers",
      path: "/bloggers",
      showLoggedIn: true,
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Chat",
      path: "/chat",
      showLoggedIn: true,
    },
    // {
    //   icon: <Info className="w-5 h-5" />,
    //   label: "About",
    //   path: "/about",
    //   showAlways: true,
    // },
  ];

  return (
    <div className="hidden md:flex items-center space-x-3">
      {navItems.map(
        (item) =>
          (item.showAlways || (item.showLoggedIn && currentUser?.userId)) && (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              <span className="text-sm font-medium">{item.icon}</span>
            </button>
          )
      )}

      <DarkToggleButton />
    </div>
  );
};

const NavbarUserProfileSection = ({ currentUser }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${Api}/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Logout successfully!");
        navigate("/login");
      }
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="md:hidden block">
        <DarkToggleButton />
      </div>
      {currentUser?.userId ? (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="dark:bg-darkPostCardBackground border border-gray-700 shadow-sm rounded-full pr-3 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={
                  currentUser?.avatar ||
                  "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
                }
                alt="Profile"
              />
              <ChevronDown className="w-4 h-4" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-44 px-2 bg-white dark:bg-darkPostCardBackground rounded-lg shadow-lg border dark:border-gray-700 py-2">
                <div className="w-full px-3 flex justify-center items-center md:hover:bg-gray-100 rounded-2xl md:dark:hover:bg-gray-700">
                  <span className="text-gray-800 dark:text-white">
                    <User2 />
                  </span>
                  <button
                    onClick={() => {
                      navigate(`/profile/${currentUser?.userId}`);
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm dark:text-white text-gray-800 "
                  >
                    {currentUser?.username || "Profile"}
                  </button>
                </div>
                <div className="w-full px-3 flex justify-center items-center md:hover:bg-gray-100 rounded-2xl md:dark:hover:bg-gray-700">
                  <span className="text-gray-800 dark:text-white">
                    <LogOutIcon />
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm dark:text-white text-gray-800 "
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white border border-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 transition"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium bg-darkPostCardBackground text-white dark:text-gray-700 dark:bg-white rounded-lg transition"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

function Navbar() {
  const { currentUser } = useContext(AuthContext);

  return (
    <nav className="w-full sticky top-0 bg-white dark:bg-darkBackground z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavbarLogo />
          <div className="flex gap-3">
            <NavbarNavigationTray currentUser={currentUser} />
            <div>
              <MobileNavbar currentUser={currentUser} />
            </div>
            <NavbarUserProfileSection currentUser={currentUser} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
