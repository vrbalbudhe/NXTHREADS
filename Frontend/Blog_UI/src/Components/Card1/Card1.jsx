/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";

function Card1({ isCurrentUser }) {
  const navigate = useNavigate();

  return (
    isCurrentUser && (
      <div
        onClick={() => navigate("/createBlog")}
        className="w-full h-[100px] cursor-pointer"
      >
        <div className="w-full h-full flex justify-between items-center dark:bg-darkPostCardBackground border border-gray-700 rounded-xl shadow-md gap-2">
          <img
            className="w-[70%] h-full object-cover rounded-l-xl"
            src="https://i.pinimg.com/564x/33/1d/5b/331d5b18133dfdb63ef43ccbfdc0fbda.jpg"
            alt="Blog Writing"
          />
          <h1 className="w-[30%] text-center font-semibold text-xs flex-wrap">Write a Blog</h1>
        </div>
      </div>
    )
  );
}

export default Card1;
