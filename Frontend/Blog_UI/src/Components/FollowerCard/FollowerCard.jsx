/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function FollowerCard({ userId }) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const [totalFollowers, setTotalFollowers] = useState([]);
  const handleFollowersData = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/userfollow/followers/${userId}`,
        { withCredentials: true }
      );
      setTotalFollowers(res.data.totalFollowers);
      // console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    handleFollowersData();
  }, [userId]);
  return (
    <div className="w-[90%] h-fit flex justify-start items-start p-1 flex-col rounded-2xl shadow-sm ">
      <div className="w-full h-14 flex justify-start items-center pl-2">
        <h1 className="font-bold text-sm dark:text-white">Followers</h1>
      </div>
      {totalFollowers.length < 0 && (
        <div className="w-full h-10 flex justify-center items-center dark:border-darkBlue dark:border rounded-2xl">
          <p className="dark:text-slate-400 text-sm ">No Following</p>
        </div>
      )}{" "}
      <div className="w-full h-fit flex justify-start items-start flex-col gap-1">
        {totalFollowers.map((follower, index) => (
          <div
            key={follower.id}
            className="w-full h-14 rounded-md flex shadow-sm border-b border-slate-300 cursor-pointer hover:bg-gray-100 "
          >
            <div className="w-[20%] h-full flex justify-center items-center">
              <img
                className="w-10 h-10 object-cover rounded-full border-2 border-slate-300"
                src={follower.follower.avatar}
              />
            </div>
            <div className="w-[80%] h-full flex flex-col justify-center items-start pl-5">
              <h1 className="text-xs font-bold text-slate-900">
                {follower.follower.fullname}
              </h1>
              <h1 className="text-xs font-semibold text-slate-600">
                {follower.follower.username}
              </h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FollowerCard;
