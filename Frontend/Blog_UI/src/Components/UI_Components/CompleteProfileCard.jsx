import { GemIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CompleteProfileCard({ currentUser }) {
  const navigate = useNavigate();

  const missingFields = [];

  if (!currentUser?.avatar?.trim()) missingFields.push("Avatar");
  if (!currentUser?.fullname?.trim()) missingFields.push("Fullname");
  if (!currentUser?.gender?.trim()) missingFields.push("Gender");

  const isProfileComplete = missingFields.length === 0;

  if (!currentUser || isProfileComplete) return null;

  return (
    <div className="border border-gray-300 select-none bg-white dark:bg-darkPostCardBackground shadow-md w-full min-h-40 p-1 rounded-2xl dark:border-gray-700">
      <div className="w-full p-1 min-h-12 flex justify-start items-center gap-2 border-b border-gray-300 dark:border-gray-700">
        <span className="text-yellow-500">
          <GemIcon size={20} />
        </span>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Complete Your Profile
        </p>
      </div>

      <div className="w-full p-2 flex flex-col gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          To get the most out of your experience, please complete your profile:
        </p>

        <ul className="list-disc list-inside text-xs text-red-500">
          {missingFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>

        <button
          onClick={() => navigate(`/profile/${currentUser.userId}`)}
          className="w-fit text-xs font-semibold px-3 py-1 rounded-md bg-gray-600 text-white hover:bg-blue-700 transition"
        >
          Complete Now
        </button>
      </div>
    </div>
  );
}

export default CompleteProfileCard;
