function FollowersCard({ post, totalFollowing, totalFollowers }) {
  return (
    <div className="w-full h-full bg-gradient-to-r rounded-xl border dark:border-none border-slate-100 flex justify-center items-center md:gap-5">
      <div className="flex flex-col justify-center items-center w-32 h-32 rounded-2xl">
        <h1 className="font-semibold text-4xl md:text-8xl dark:text-gray-400">
          {totalFollowing ? totalFollowing : "0"}
        </h1>
        <h1 className="font-semibold text-xs md:text-sm text-slate-500">
          Followers
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center w-32 h-32 rounded-2xl">
        <h1 className="font-semibold text-4xl md:text-8xl dark:text-gray-400">
          {totalFollowers ? totalFollowers : "0"}
        </h1>
        <h1 className="font-semibold text-xs md:text-sm text-slate-500">
          Following
        </h1>
      </div>
      <div className="flex flex-col justify-center items-center w-32 h-32 rounded-2xl">
        <h1 className="font-semibold text-4xl md:text-8xl cursor-pointer dark:text-gray-400">
          {post?.length || 0}
        </h1>
        <h1 className="font-semibold text-xs md:text-sm text-slate-500">
          Posts
        </h1>
      </div>
    </div>
  );
}

export default FollowersCard;
