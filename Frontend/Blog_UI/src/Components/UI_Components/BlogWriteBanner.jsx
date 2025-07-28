import { useNavigate } from "react-router-dom";

function BlogWriteBanner({ isCurrentUser }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/createBlog")}
      className="w-full h-[100px] cursor-pointer select-none"
    >
      <div className="w-full h-full select-none flex justify-between items-center dark:bg-darkPostCardBackground border border-gray-300 dark:border-gray-700 rounded-2xl shadow-md gap-2">
        <img
          className="w-[60%] h-full object-cover rounded-l-2xl"
          src="https://i.pinimg.com/564x/33/1d/5b/331d5b18133dfdb63ef43ccbfdc0fbda.jpg"
          alt="Blog Writing"
        />
        <h1 className="w-[40%] text-center text-gray-800 dark:text-white font-medium text-xs flex-wrap">
          Write a Blog
        </h1>
      </div>
    </div>
  );
}

export default BlogWriteBanner;
