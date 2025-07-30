/* eslint-disable react/prop-types */
import { useState } from "react";

function DialogBox({ message, closeDialog, trigger, onConfirm }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = (shouldConfirm) => {
    setIsOpen(false);
    closeDialog(false); // close modal
    if (shouldConfirm && onConfirm) {
      onConfirm();
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-gray-900 bg-opacity-50 z-50">
        <div className="w-72 max-w-sm p-6 border-2 dark:border-gray-700 shadow-lg rounded-lg bg-white dark:bg-darkPostCardBackground">
          <div className="mb-4">
            <h1 className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {message}
            </h1>
          </div>
          <div className="flex justify-start space-x-4">
            <button
              onClick={() => handleClose(true)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {trigger}
            </button>
            <button
              onClick={() => handleClose(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
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
