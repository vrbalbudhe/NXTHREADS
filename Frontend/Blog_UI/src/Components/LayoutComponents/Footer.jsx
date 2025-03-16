import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="border bg-[#1c2833] dark:border-none border-slate-100 shadow-lg text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <span>
            <img
              className="w-6 h-6 rounded-full inline"
              src="/favicon.jpg"
              alt=""
            />
            <span className="text-sm text-white ml-2 font-bold mb-2">
              NEXTHREADS
            </span>
          </span>
          <p className="text-white">
            Your go-to platform for creative blogging
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 mb-4 md:mb-0">
          <a
            href="/"
            className=" text-white text-xs font-semibold hover:text-gray-400"
          >
            Home
          </a>
          <a
            href="/search"
            className=" text-white text-xs font-semibold hover:text-gray-400"
          >
            Search
          </a>
          <a
            href="/about"
            className=" text-white text-xs font-semibold hover:text-gray-400"
          >
            About
          </a>
          <a
            href="/policy"
            className=" text-white text-xs font-semibold hover:text-gray-400"
          >
            Privacy Policy
          </a>
        </div>
        <div className="flex gap-4">
          <a
            href="https://facebook.com"
            className="text-gray-800 hover:text-white"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://twitter.com"
            className="text-gray-800 hover:text-white"
            aria-label="Twitter"
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com"
            className="text-gray-800 hover:text-white"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://linkedin.com"
            className="text-gray-800 hover:text-white"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
      <div className="w-full flex justify-center items-center py-2 text-center">
        <p className="h-full py-2 text-xs w-[80%] rounded-full text-white font-semibold">
          &copy; 2024 NEXTHREADS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
