import React from "react";

export default function Spinner({ text }) {
  return (
    <div className="flex justify-center items-center gap-2 h-80 select-none">
      <div className="w-8 h-8 border-2 border-gray-800 dark:border-white border-dashed rounded-full animate-spin"></div>
      <div>
        <p className="dark:text-white text-gray-800">{text}</p>
      </div>
    </div>
  );
}
