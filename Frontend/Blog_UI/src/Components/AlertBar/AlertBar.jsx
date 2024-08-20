/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AlertBar() {
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

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [currentIndex]);

  const navigate = useNavigate();
  return (
    <div className="w-[100%] border shadow-2xl border-slate-50 rounded-3xl absolute flex flex-col justify-center items-center backdrop-blur-xl opacity-90 h-[600px]">
      <div className="w-full h-20 flex justify-center items-center gap-2">
        <img className="w-12 h-12 rounded-full" src="/favicon.jpg" alt="" />
        <h1 className="font-semibold text-slate-900 text-[60px]">NEXTHREADS</h1>
      </div>
      <div className="w-full h-5 flex justify-center items-center mb-5">
        <h1 className="font-semibold text-slate-800 text-sm">{searchTerm}</h1>
      </div>
      <div className="w-[60%] h-[30%] bg-white border flex-col shadow-md rounded-xl border-slate-200 flex justify-center items-center">
        <h1 className="font-bold text-slate-800 text-md tracking-tighter">
          Enjoy the latest blogs across all categories..{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-lg text-blue-400 cursor-pointer"
          >
            Register Now
          </span>
        </h1>
        <div className="w-fit h-fit flex justify-center items-center gap-3">
          <h1
            onClick={() => navigate("/login")}
            className="w-fit font-semibold cursor-pointer border hover:bg-blue-400 border-slate-300 hover:text-white text-slate-800 rounded-md text-sm px-2 py-1 mt-2"
          >
            Login Now!
          </h1>
          <h1
            onClick={() => navigate("/register")}
            className="w-fit font-semibold cursor-pointer border hover:bg-blue-400 border-slate-300 hover:text-white text-slate-800 rounded-md text-sm px-2 py-1 mt-2"
          >
            Register
          </h1>
          <h1
            onClick={() => navigate("/about")}
            className="w-fit font-semibold cursor-pointer border hover:bg-blue-400 border-slate-300 hover:text-white text-slate-800 rounded-md text-sm px-2 py-1 mt-2"
          >
            More Infomation
          </h1>
        </div>
      </div>
    </div>
  );
}

export default AlertBar;
