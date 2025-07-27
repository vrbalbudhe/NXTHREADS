import { Ban, Calendar, Clock, Flag, Info, MoreVertical } from "lucide-react";
import React, { useState } from "react";

const UserHeadingSection = ({ post }) => {
  const UndefinedImage =
    "https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png";

  return (
    <div className="flex items-center space-x-3">
      <img
        src={post?.User?.avatar || UndefinedImage}
        alt={post.author}
        className="w-10 h-10 rounded-full text-white dark:text-white object-cover"
      />
      <div>
        <h2 className="font-semibold text-gray-800 dark:text-white">
          {post.author}
        </h2>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-white">
          <Calendar className="w-3 h-3" />
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <Clock className="w-3 h-3" />
          <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

const PostHeaderDropDownMenu = () => {
  const [isdropdown, setIsDropDown] = useState(false);

  const handleDropDownMenu = () => {
    setIsDropDown(!isdropdown);
  };
  return (
    <div className="relative">
      <button
        onClick={handleDropDownMenu}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {isdropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border dark:bg-darkPostCardBackground dark:border-gray-700">
          <ul className="py-2">
            <li className="flex items-center px-4 py-2 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Flag className="w-4 h-4 mr-2" />
              <span>Report</span>
            </li>
            <li className="flex items-center px-4 py-2 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Ban className="w-4 h-4 mr-2" />
              <span>Block</span>
            </li>
            <li className="flex items-center px-4 py-2 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <Info className="w-4 h-4 mr-2" />
              <span>About</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

function PostHeader({ post }) {
  return (
    <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
      <UserHeadingSection post={post} />
      <PostHeaderDropDownMenu />
    </div>
  );
}

export default PostHeader;
