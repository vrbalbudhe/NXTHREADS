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
  Bell,
  MessageSquare,
  PenSquare,
  ChevronDown,
} from "lucide-react";

function Navbar() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };

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
    {
      icon: <Info className="w-5 h-5" />,
      label: "About",
      path: "/about",
      showAlways: true,
    },
  ];

  return (
    <nav className="w-full sticky top-0 bg-gray-50 dark:bg-[#01161e] shadow-md z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <img
              className="w-10 h-10 rounded-2xl object-cover"
              src="/favicon.jpg"
              alt="Logo"
            />
            <h1
              onClick={() => navigate("/")}
              className="text-md font-semibold text-blue-600 dark:text-white cursor-pointer hover:underline"
            >
              NXTHREADS
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(
              (item) =>
                (item.showAlways ||
                  (item.showLoggedIn && currentUser?.userId)) && (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
            )}

            <button
              onClick={toggleDarkMode}
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {currentUser?.userId ? (
              <div className="flex items-center space-x-3">
                <button className="relative text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
                  >
                    <img
                      className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                      src={
                        currentUser?.avatar ||
                        "https://i.pinimg.com/564x/7f/c4/c6/7fc4c6ecc7738247aac61a60958429d4.jpg"
                      }
                      alt="Profile"
                    />
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2">
                      <button
                        onClick={() => {
                          navigate(`/profile/${currentUser?.userId}`);
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {currentUser?.username || "Profile"}
                      </button>
                      <button
                        onClick={() => {
                          // Add logout functionality
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-800 transition"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
