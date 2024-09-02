/* eslint-disable no-unused-vars */
import { Suspense, useContext, useEffect, useState } from "react";
import { Await, useLoaderData } from "react-router-dom";
import UserCard from "../../Components/UserCard/UserCard";
import OnlyUserSearch from "../../Components/OnlyUserSearch/OnlyUserSearch";
import { IoSearch } from "react-icons/io5";
import FollowerCard from "../../Components/FollowerCard/FollowerCard";
import { AuthContext } from "../../Context/AuthContext";
import FollowingCard from "../../Components/FollowingCard/FollowingCard";
// import { io } from "socket.io-client";

function BloggersPage() {
  const { postResponse } = useLoaderData() || {};
  const { currentUser } = useContext(AuthContext) || {};

  const users = postResponse?.data?.users || [];

  const [status, setStatus] = useState(null);

  // const socket = io("http://localhost:8000", {
  //   reconnection: true,
  //   withCredentials: true,
  // });

  // useEffect(() => {
  //   socket.on("connection", (data) => {
  //     console.log(data);
  //   });
  //   socket.on("totalFollowings", (data) => {
  //     console.log("Received 'following' event on client:", data);
  //   });

  //   return () => {
  //     socket.off("totalFollowingsUpdate");
  //   };
  // }, [io]);

  return (
    <div className="w-full  min-h-[500px] gap-2 mt-5 flex justify-center items-start">
      <div className="w-[70%] min-h-[500px] h-full justify-center items-center">
        <div className="w-[95%] h-fit rounded-lg mt-5 flex flex-col justify-center items-center"></div>
        <div className="w-full h-fit overflow-auto flex flex-wrap justify-start items-start">
          <OnlyUserSearch />
        </div>
        <div className="w-full h-fit flex justify-center gap-1 items-center mt-5"></div>
        <div className="w-full h-full flex flex-wrap justify-start items-start gap-3">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={postResponse}
              errorElement={
                <p className="w-fit pr-8 py-1 rounded-sm pl-8 bg-yellow-100">
                  Error loading Users!
                </p>
              }
            >
              {({ data }) =>
                data?.users?.length > 0 ? (
                  data.users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))
                ) : (
                  <p>No users available</p>
                )
              }
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="w-[30%] min-h-[500px] flex justify-start flex-col items-start">
        <div className="w-full h-fit overflow-auto flex justify-start items-start">
          <FollowerCard userId={currentUser?.userInfo?.id} />
        </div>
        <div className="w-full min-h-[500px] overflow-auto flex justify-start items-start">
          <FollowingCard userId={currentUser?.userInfo?.id} />
        </div>
      </div>
    </div>
  );
}

export default BloggersPage;
