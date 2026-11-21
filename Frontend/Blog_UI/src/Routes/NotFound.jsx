import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-slate-300 dark:text-gray-600">404</p>
      <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
        This page does not exist
      </h1>
      <p className="text-sm text-slate-500 dark:text-gray-400">
        The link may be broken or the page may have been removed.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-slate-950 dark:bg-white dark:text-slate-950 text-white text-sm font-semibold px-4 py-2 rounded-xl"
      >
        Back to home
      </button>
    </div>
  );
}

export default NotFound;
