/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { PostContext } from "../../Context/PostContext";

function UpdateCard({ upd }) {
  const { currentUser } = useContext(AuthContext);
  const { handleUpdateInfo } = useContext(PostContext);
  const [input, setInput] = useState({
    fullname: "",
    avatar: "",
    gender: "",
    description: "",
  });

  useEffect(() => {
    if (currentUser && upd) {
      setInput({
        fullname: upd.fullname || "",
        avatar: upd.avatar || "",
        gender: upd.gender || "",
        description: upd.description || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleUpdateInfo(input);
  };

  return (
    <div className="w-full h-[300px] rounded-xl">
      <div className="w-full h-[10%] flex flex-col justify-center items-start">
        <div className="w-full h-full justify-between flex items-center">
          <h1 className="font-semibold text-xs text-slate-900 pl-2 inline">
            Update Information
          </h1>
          <button
            onClick={handleSubmit}
            className="font-semibold text-xs text-white px-2 py-1 rounded-lg inline bg-slate-950 hover:text-blue-400"
          >
            Update
          </button>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-[95%] h-[90%] flex justify-center items-center mt-2 flex-col rounded-b-xl gap-1"
      >
        <div className="w-full h-[15%] flex justify-center items-center border border-slate-200 rounded-xl">
          <input
            className="w-[90%] h-[80%] text-xs flex justify-center items-center"
            placeholder="Fullname"
            type="text"
            name="fullname"
            value={input.fullname}
            onChange={handleInputChange}
          />
        </div>
        <div className="w-full h-[15%] text-xs flex justify-center items-center border border-slate-200 rounded-xl">
          <input
            className="w-[90%] h-[80%] flex justify-center items-center"
            placeholder="Avatar"
            type="text"
            name="avatar"
            value={input.avatar}
            onChange={handleInputChange}
          />
        </div>
        <div className="w-full h-[15%] text-xs flex justify-start ml-5 items-center rounded-xl">
          <select
            className="px-2 py-2 rounded-md border border-slate-200 bg-white text-xs"
            name="gender"
            value={input.gender}
            onChange={handleInputChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="w-full h-[55%] text-xs flex justify-start items-start border border-slate-200 rounded-xl">
          <input
            className="w-[95%] h-[100%] flex justify-start flex-wrap border-none pl-2 items-start"
            placeholder="Bio"
            type="text"
            name="description"
            value={input.description}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </div>
  );
}

export default UpdateCard;
