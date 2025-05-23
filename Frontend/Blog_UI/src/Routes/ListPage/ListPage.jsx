/* eslint-disable no-unused-vars */
import { Await, useLoaderData, useLocation } from "react-router-dom";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import PostCard from "../../Components/PostCard/PostCard";
import { Suspense, useState } from "react";
import Filter from "../../Components/Filter/Filter";

function ListPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category");
  const { postResponse } = useLoaderData();
  return (
    <div className="w-full h-full flex justify-center items-start gap-5">
      <div className="w-[70%] h-full flex flex-col">
        <div
          className="w-full mt-5 dark:border-none border
         min-h-[150px] flex flex-col justify-center items-start gap-3"
        >
          <h1 className="text-6xl tracking-tighter font-semibold text-gray-800 dark:text-white">
            {category}
          </h1>
          <h1 className="text-lg tracking-tighter font-semibold text-blue-400 dark:text-slate-400">
            <span className="dark:text-slate-200 text-gray-800">
              Results - {"  "}
            </span>
            <Suspense fallback={<p>Loading...</p>}>
              <Await
                resolve={postResponse}
                errorElement={
                  <p className="w-fit pr-8 py-1 rounded-sm pl-8 bg-yellow-100">
                    Error loading Users!
                  </p>
                }
              >
                {({ data }) => data.posts.length}
              </Await>
            </Suspense>
            <span className="dark:text-slate-200 text-gray-800"> Blogs Found..!</span>
          </h1>
        </div>
        <div className="w-full h-full ">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={postResponse}
              errorElement={
                <p className="w-fit pr-8 py-1 rounded-sm pl-8 bg-yellow-100">
                  Error loading Posts!
                </p>
              }
            >
              {({ data }) =>
                data.posts.length === 0 ? (
                  <div className="w-full h-[400px] flex justify-center items-center">
                    <img
                      className="w-[100px] h-auto"
                      src="https://cdn-icons-png.flaticon.com/512/7466/7466073.png"
                      alt=""
                    />
                    <h1
                      className="text-slate-800 font-semibold text-xl bg-yellow-100
                    px-2 py-1 rounded-md"
                    >
                      No Blogs Found!
                    </h1>
                  </div>
                ) : (
                  data.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )
              }
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="w-[30%] h-full flex flex-col gap-5 justify-center items-center">
        <Filter />
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default ListPage;
