/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from "react";
import PostCard from "../../Components/PostCard/PostCard";
import { PostContext } from "../../Context/PostContext";
import HotTopicsCard from "../../Components/HotTopicsCard/HotTopicsCard";
import Card1 from "../../Components/Card1/Card1";
import { AuthContext } from "../../Context/AuthContext";

function Homepage() {
  const { posts, loading, error, fetchGeneralPosts, page, setPage, hasMore } =
    useContext(PostContext);
  const { currentUser } = useContext(AuthContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const searchArray = [
      "Welcome to our blog site!",
      "Discover the latest in Technology.",
      "Dive into the world of Programming.",
      "Explore insights on Web Development.",
      "Stay updated with Mobile Development trends.",
      "Learn about Software Engineering practices.",
      "Unlock the potential of Data Science.",
      "Stay secure with Cybersecurity tips.",
      "Harness the power of Cloud Computing.",
      "Stay ahead with Blockchain developments.",
      "Boost your skills in Digital Marketing.",
      "Get inspired with Entrepreneurship stories.",
      "Unleash your creativity with Design.",
      "Dive into the exciting world of Gaming.",
      "Improve your Health and Wellness.",
      "Get travel tips and destination guides.",
      "Enjoy delicious recipes in Food and Cooking.",
      "Stay trendy with Fashion updates.",
      "Capture moments with Photography tips.",
      "Keep up with the latest in Sports.",
      "Focus on your Personal Development.",
    ];

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % searchArray.length);
      setSearchTerm(searchArray[currentIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);
  const handleScroll = () => {
    // console.log("innerHeight:", window.innerHeight);
    // console.log("scroll top:", document.documentElement.scrollTop);
    // console.log("scrollHeight:", document.documentElement.scrollHeight);
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.scrollHeight
    )
      return;
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    fetchGeneralPosts();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="w-full min-h-fit mt-5 flex gap-5">
      <div
        className={`w-[70%]  h-full flex flex-col justify-center items-center`}
      >
        <div className="w-full h-28 bg-gradient-to-r from-violet-800 via-pink-600 to-yellow-200 bg-clip-text text-transparent mb-5 rounded-xl flex justify-center items-center">
          <h1 className="font-semibold text-4xl">{searchTerm}</h1>
        </div>
        <div className="w-full h-fit flex justify-center items-center flex-col">
          {posts?.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div>No posts available</div>
          )}
        </div>
      </div>
      <div className="w-[30%] h-full rounded-xl">
        {currentUser?.userInfo && (
          <Card1 isCurrentUser={currentUser?.userInfo.id} />
        )}
        <HotTopicsCard />
      </div>
    </div>
  );
}

export default Homepage;
