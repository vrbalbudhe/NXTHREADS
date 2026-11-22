import { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../Context/AuthContext";

function DeleteAccountCard({ onClose }) {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const canDelete = password.length > 0 && confirmText === "DELETE" && !loading;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!canDelete) return;
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.delete(`${baseUrl}/api/user/${currentUser?.userId}`, {
        data: { password },
        withCredentials: true,
      });
      toast.success("Your account has been deleted");
      setCurrentUser(null);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleDelete}
      className="md:w-full w-[90%] md:max-w-lg mx-auto bg-white dark:bg-darkPostCardBackground border border-red-300 dark:border-red-900 rounded-xl p-5 shadow-lg space-y-3"
    >
      <h1 className="text-sm font-bold text-red-600">Delete account</h1>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        This permanently deletes your profile, posts, comments, likes, saved posts, follows and
        messages. It cannot be undone.
      </p>
      <input
        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
        type="text"
        placeholder='Type "DELETE" to confirm'
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold px-3 py-1 rounded-lg border border-slate-300 dark:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canDelete}
          className={`text-xs font-semibold text-white px-3 py-1 rounded-lg ${
            canDelete ? "bg-red-600 hover:bg-red-500" : "bg-gray-400"
          }`}
        >
          {loading ? "Deleting..." : "Delete permanently"}
        </button>
      </div>
    </form>
  );
}

export default DeleteAccountCard;
