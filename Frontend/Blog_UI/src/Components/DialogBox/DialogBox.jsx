/* eslint-disable react/prop-types */
import { useState } from "react";

function DialogBox({ message, closeDialog, trigger }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = (shouldClose) => {
    setIsOpen(false);
    closeDialog(shouldClose);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-gray-800 bg-opacity-50">
        <div className="w-80 max-w-sm p-6 border-2 border-gray-300 shadow-lg rounded-lg bg-white">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-800">{message}</h1>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {trigger}
            </button>
            <button
              onClick={() => handleClose(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default DialogBox;
