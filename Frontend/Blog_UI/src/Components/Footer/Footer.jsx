import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-slate-50 border border-slate-300 shadow-lg rounded-t-xl text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <span>
            <img
              className="w-6 h-6 rounded-full inline"
              src="/favicon.jpg"
              alt=""
            />
            <span className="text-sm text-slate-800 font-bold mb-2">
              NEXTHREADS
            </span>
          </span>
          <p className="text-gray-600">
            Your go-to platform for creative blogging
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 mb-4 md:mb-0">
          <a
            href="/"
            className=" text-slate-800 text-xs font-semibold hover:text-gray-400"
          >
            Home
          </a>
          <a
            href="/search"
            className=" text-slate-800 text-xs font-semibold hover:text-gray-400"
          >
            Search
          </a>
          <a
            href="/about"
            className=" text-slate-800 text-xs font-semibold hover:text-gray-400"
          >
            About
          </a>
          <a
            href="/policy"
            className=" text-slate-800 text-xs font-semibold hover:text-gray-400"
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
      <div className="bg-gray-100 py-2 text-center">
        <p className="text-xs text-slate-800 font-semibold">
          &copy; 2024 NEXTHREADS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
