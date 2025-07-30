/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UpdateCard({ upd }) {
  const { currentUser } = useContext(AuthContext);
  const [input, setInput] = useState({
    password: "",
    fullname: "",
    avatar: "",
    gender: "",
    verified: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && upd) {
      setInput({
        password: "",
        fullname: upd.fullname || "",
        avatar: upd.avatar || "",
        gender: upd.gender || "",
        verified: upd.verified || false,
      });
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInput((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.put(
        `${baseUrl}/api/user/upd/${currentUser?.userId}`,
        input,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      toast.error("An error occurred while updating.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:w-full w-[90%] md:max-w-lg mx-auto bg-white dark:bg-darkPostCardBackground border border-slate-300 dark:border-gray-700 rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-sm font-bold text-slate-800 dark:text-white">
          Update Profile
        </h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`text-xs font-semibold text-white px-3 py-1 rounded-lg ${
            loading ? "bg-gray-400" : "bg-slate-950 hover:text-blue-400"
          }`}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
          placeholder="Password"
          type="password"
          name="password"
          value={input.password}
          onChange={handleInputChange}
        />
        <input
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
          placeholder="Fullname"
          type="text"
          name="fullname"
          value={input.fullname}
          onChange={handleInputChange}
        />
        <input
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md"
          placeholder="Avatar URL"
          type="text"
          name="avatar"
          value={input.avatar}
          onChange={handleInputChange}
        />
        <select
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md bg-white"
          name="gender"
          value={input.gender}
          onChange={handleInputChange}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            name="verified"
            checked={input.verified}
            onChange={handleInputChange}
          />
          Verified
        </label>
      </form>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default UpdateCard;
