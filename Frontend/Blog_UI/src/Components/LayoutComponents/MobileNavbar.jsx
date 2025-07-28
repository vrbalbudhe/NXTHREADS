import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  Search,
  PenSquare,
  Users,
  MessageSquare,
  Sun,
  Moon,
  User2Icon,
} from "lucide-react";

const MobileNavbar = ({ currentUser }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const navItems = [
    {
      icon: <Home className="w-7 h-7" />,
      label: "Home",
      path: "/",
      showAlways: true,
    },
    {
      icon: <Search className="w-7 h-7" />,
      label: "Search",
      path: "/search",
      showAlways: true,
    },
    {
      icon: <PenSquare className="w-7 h-7" />,
      label: "Create",
      path: "/createBlog",
      showLoggedIn: true,
    },
    {
      icon: <Users className="w-7 h-7" />,
      label: "Bloggers",
      path: "/bloggers",
      showLoggedIn: true,
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      label: "Chat",
      path: "/chat",
      showLoggedIn: true,
    },
    {
      icon: <User2Icon className="w-7 h-7" />,
      label: "Profile",
      path: `profile/${currentUser?.userId}`,
      showLoggedIn: true,
    },
  ];

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-darkPostCardBackground  border-gray-300 dark:border-gray-700 pl-10 pr-10 py-3 flex ${currentUser?" justify-between":" justify-center gap-5"} items-center shadow-md`}
    >
      {navItems.map(
        (item) =>
          (item.showAlways || (item.showLoggedIn && currentUser?.userId)) && (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center text-gray-600 dark:text-gray-400 md:hover:text-blue-500 md:dark:hover:text-blue-400 transition"
            >
              {item.icon}
              {/* <span className="text-[10px] mt-0.5">{item.label}</span> */}
            </button>
          )
      )}
    </div>
  );
};

export default MobileNavbar;
