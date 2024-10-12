/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FollowingCard({ userId }) {
  const navigate = useNavigate();
  const [totalFollowing, setTotalFollowing] = useState([]);
  const handleFollowingData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/userfollow/following/${userId}`,
        { withCredentials: true }
      );
      setTotalFollowing(res.data.totalFollowings);
      // console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    handleFollowingData();
  });
  return (
    <div className="w-[90%] h-fit  mt-2 flex justify-start items-start p-1 flex-col rounded-2xl">
      <div className="w-full h-14 flex justify-start items-center pl-2">
        <h1 className="font-bold text-sm dark:text-white">Following</h1>
      </div>
      {totalFollowing.length < 0 && (
        <div className="w-full h-10 flex justify-center items-center dark:border-darkBlue dark:border rounded-2xl">
          <p className="dark:text-slate-400 text-sm ">No Following</p>
        </div>
      )}{" "}
      <div className="w-full h-fit flex justify-start items-start flex-col gap-1">
        {totalFollowing.map((follower, index) => (
          <div
            key={follower.id}
            className="w-full h-14 cursor-pointer border-b hover:bg-gray-200 rounded-sm flex shadow-sm border-slate-300"
          >
            <div className="w-[20%] h-full flex justify-center items-center">
              <img
                className="w-10 object-cover h-10 rounded-full border-2 border-slate-300"
                src={follower.following.avatar}
              />
            </div>
            <div className="w-[80%] h-full flex flex-col justify-center items-start pl-5">
              <h1 className="text-xs font-bold text-slate-900">
                {follower.following.fullname}
              </h1>
              <h1 className="text-xs font-semibold text-slate-600">
                {follower.following.username}
              </h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FollowingCard;
