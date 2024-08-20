import { Await, useLoaderData } from "react-router-dom";
import Filter from "../../Components/Filter/Filter";
import PostCard from "../../Components/PostCard/PostCard";
import { Suspense, useState } from "react";
import NextPrevious from "../../Components/NextPrevious/NextPrevious";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import SearchBar from "../../Components/SearchBar/SearchBar";
import { LuGalleryHorizontalEnd } from "react-icons/lu";

function Search() {
  const { postResponse } = useLoaderData();

  const [prev, setPrev] = useState(0);
  const [next, setNext] = useState(3);
  const [total, setTotal] = useState();
  const handlePrev = () => {
    if (prev > 0) {
      setPrev(() => prev - 3);
      setNext(() => next - 3);
    }
  };
  const handleNext = () => {
    if (total > next) {
      setPrev(() => prev + 3);
      setNext(() => next + 3);
    }
  };

  return (
    <div className="w-full min-h-[500px] flex justify-start items-start mt-5 gap-2">
      <div className="w-[70%] h-full p-1 flex flex-col justify-start gap-2 items-start">
        <SearchBar />
        <div className="w-full h-fit pl-5 flex flex-col justify-start items-start">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <LuGalleryHorizontalEnd className="text-2xl" />
            <span>All Posts</span>
          </h1>
          <h1 className="text-sm font-semibold text-red-700">
            <span className="text-slate-900">Results - {total}</span>
            <Suspense fallback={<p>Loading...</p>}>
              <Await
                resolve={postResponse}
                errorElement={
                  <p className="w-fit pr-8 py-1 rounded-sm pl-8 bg-yellow-100">
                    Error loading Users!
                  </p>
                }
              >
                {({ data }) => {
                  setTotal(data.posts.length);
                }}
              </Await>
            </Suspense>
            <span className="text-slate-800 text-sm"> Blogs Found..!</span>
          </h1>
        </div>
        <div className="w-full h-fit">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={postResponse}
              errorElement={
                <div className="w-full h-[400px] flex justify-center items-center">
                  <p className="text-lg">No posts found</p>
                </div>
              }
            >
              {({ data }) =>
                data.posts
                  .slice(prev, next)
                  .map((post) => <PostCard key={post.id} post={post} />)
              }
            </Await>
          </Suspense>
        </div>
        <NextPrevious prev={handlePrev} next={handleNext} />
      </div>
      <div className="w-[30%] h-full flex flex-col justify-center items-start">
        <Filter />
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default Search;
