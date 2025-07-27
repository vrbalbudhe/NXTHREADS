import React from "react";

const DarkToggleButton = ({ toggleDarkMode }) => {
  return (
    <button
      onClick={toggleDarkMode}
      className="px-2 py-1 text-xs border rounded-md transition-colors duration-300 
                 bg-white text-black border-gray-300 
                 dark:bg-gray-800 dark:text-white dark:border-gray-600 
                 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Dark Mode
    </button>
  );
};

export default DarkToggleButton;
