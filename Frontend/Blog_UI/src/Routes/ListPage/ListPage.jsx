import { useLocation } from "react-router-dom";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import PostCard from "../../Components/PostCard/PostCard";
import { useEffect } from "react";
import Filter from "../../Components/Filter/Filter";
import { useFetchAllUsers } from "../../Loaders/users/useFetchAllUsers";
import { useFetchQueryPosts } from "../../Loaders/posts/useFetchQueryPosts";

function PageCategoryHeading({ category, count }) {
  return (
    <div className="w-full p-2 md:p-0 mt-5 min-h-[150px] flex flex-col justify-center items-start gap-3">
      <h1 className="md:text-4xl text-3xl font-medium text-gray-800 dark:text-white">
        {category}
      </h1>
      <h1 className="text-md font-normal text-blue-400 dark:text-slate-400">
        <span className="dark:text-slate-200 text-gray-800">Results - </span>
        {count}
        <span className="dark:text-slate-200 text-gray-800">
          {" "}
          Blogs Found..!
        </span>
      </h1>
    </div>
  );
}

function ListPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryParamsObj = Object.fromEntries([...queryParams.entries()]);

  const { users } = useFetchAllUsers();
  const { queryPosts, error, loadQueryPosts } =
    useFetchQueryPosts(queryParamsObj);

  const category = queryParams.get("category") || "All";
  const author = queryParams.get("author") || "All";
  useEffect(() => {
    loadQueryPosts();
  }, [category, author]);

  return (
    <div className="w-full h-full p-2 md:p-0 flex md:flex-row flex-col-reverse justify-center items-start gap-5">
      <div className="md:w-[75%] w-full h-full flex flex-col">
        <PageCategoryHeading
          category={category}
          count={queryPosts?.length || 0}
        />
        <div className="w-full h-full flex flex-col gap-4">
          {Array.isArray(queryPosts) && queryPosts.length > 0 ? (
            queryPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="w-full h-[400px] flex justify-center items-center">
              <img
                className="w-[100px] h-auto"
                src="https://cdn-icons-png.flaticon.com/512/7466/7466073.png"
                alt=""
              />
              <h1 className="text-slate-800 font-semibold text-xl bg-yellow-100 px-2 py-1 rounded-md">
                No Blogs Found!
              </h1>
            </div>
          )}
        </div>
      </div>
      <div className="md:w-[25%] h-full flex flex-col gap-5 justify-center items-center">
        <Filter users={users} />
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default ListPage;
