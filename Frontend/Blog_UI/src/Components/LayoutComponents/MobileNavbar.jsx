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
      icon: <User2Icon className="w-5 h-5" />,
      label: "Profile",
      path: `profile/${currentUser?.userId}`,
      showLoggedIn: true,
    },
  ];

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-darkPostCardBackground border-t border-gray-300 dark:border-gray-700 px-4 py-2 flex justify-center gap-5 items-center shadow-md">
      {navItems.map(
        (item) =>
          (item.showAlways || (item.showLoggedIn && currentUser?.userId)) && (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              {item.icon}
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          )
      )}
    </div>
  );
};

export default MobileNavbar;
