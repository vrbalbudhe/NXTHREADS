/* eslint-disable react/prop-types */

import { Suspense } from "react";
import { Await } from "react-router-dom";

function FollowersCard({ post, totalFollowing, totalFollowers }) {
  // console.log(totalFollowing);
  return (
    <div className="w-full h-full bg-gradient-to-r rounded-xl border border-slate-100 flex justify-center items-center gap-5">
      <div className=" flex flex-col justify-center items-center w-32 h-32 rounded-2xl">
        <h1 className="font-semibold text-7xl">
          <Suspense fallback={<span>Loading...</span>}>
            <Await resolve={totalFollowing} errorElement={<span>Error</span>}>
              {({ totalFollowings = [] }) => totalFollowings.length}
            </Await>
          </Suspense>
        </h1>
        <h1 className="font-semibold text-sm text-slate-500">following</h1>
      </div>
      <div className="flex flex-col justify-center items-center w-32 h-32 rounded-2xl">
        <h1 className="font-semibold text-7xl">
          <Suspense fallback={<span>Loading...</span>}>
            <Await resolve={totalFollowers} errorElement={<span>Error</span>}>
              {({ totalFollowers = [] }) => totalFollowers.length}
            </Await>
          </Suspense>
        </h1>
        <h1 className="font-semibold text-sm text-slate-500">followers</h1>
      </div>
      <div className="flex flex-col justify-center items-center w-32 h-32 rounded-2xl">
        <h1 className="font-semibold text-7xl cursor-pointer">
          <Suspense fallback={<span className="text-sm">Loading...</span>}>
            <Await
              resolve={post}
              errorElement={
                <p className="w-[100%] text-xs py-1 px-2 rounded-full bg-yellow-100">
                  Error Getting posts!
                </p>
              }
            >
              {({ data }) => data.posts.length}
            </Await>
          </Suspense>
        </h1>
        <h1 className="font-semibold text-sm text-slate-500">Posts</h1>
      </div>
    </div>
  );
}

export default FollowersCard;
