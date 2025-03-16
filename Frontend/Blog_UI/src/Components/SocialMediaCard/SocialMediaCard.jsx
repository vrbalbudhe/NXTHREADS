import { CiInstagram } from "react-icons/ci";
import { RiTwitterXLine } from "react-icons/ri";
import { FaPinterest } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSnapchat } from "react-icons/fa";
import { FaSquareGithub } from "react-icons/fa6";
import { FaStackOverflow } from "react-icons/fa";
function SocialMediaCard() {
  const handleRoute = (linkAddress) => {
    <a href={linkAddress}></a>;
  };
  return (
    <div className="w-full dark:text-darkText rounded-xl dark:border-none text-2xl h-10 flex justify-center items-center gap-2 border border-slate-200 shadow-md dark:bg-[#01161e]">
      <h1
        onClick={handleRoute("")}
        className="text-slate-800 dark:text-darkText hover:text-red-400 cursor-pointer"
      >
        <RiTwitterXLine />
      </h1>
      <h1
        onClick={handleRoute("")}
        className="text-slate-800 dark:text-darkText hover:text-red-400 cursor-pointer"
      >
        <FaPinterest />
      </h1>
      <h1
        onClick={handleRoute("")}
        className="text-slate-800 dark:text-darkText hover:text-red-400 cursor-pointer"
      >
        <CiInstagram />
      </h1>
      <h1
        onClick={handleRoute("")}
        className="text-slate-800 dark:text-darkText hover:text-red-400 cursor-pointer"
      >
        <FaFacebookSquare />
      </h1>
      <h1
        onClick={handleRoute("")}
        className="text-slate-800 dark:text-darkText hover:text-red-400 cursor-pointer"
      >
        <FaSnapchat />
      </h1>
      <h1
        onClick={handleRoute("")}
        className="text-slate-800 dark:text-darkText hover:text-red-400 cursor-pointer"
      >
        <FaSquareGithub />
      </h1>
      <h1
        onClick={handleRoute("")}
        className="text-slate-800 dark:text-darkText hover:text-red-400 cursor-pointer"
      >
        <FaStackOverflow />
      </h1>
    </div>
  );
}

export default SocialMediaCard;
