import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

function BrandSection() {
  return (
    <div className="flex flex-col items-center md:items-start space-y-2">
      <div className="flex items-center space-x-2">
        <img
          className="w-8 h-8 rounded-full object-cover"
          src="/favicon.jpg"
          alt="NEXTHREADS Logo"
        />
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          NEXTHREADS
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
        Your go-to platform for creative blogging
      </p>
    </div>
  );
}

function NavLinks() {
  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-8">
      <a
        href="/"
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Home
      </a>
      <a
        href="/search"
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Search
      </a>
      <a
        href="/bloggers"
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Bloggers
      </a>
      <a
        href="/about"
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        About
      </a>
      <a
        href="/policy"
        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        Privacy Policy
      </a>
    </div>
  );
}

function SocialLinks() {
  return (
    <div className="flex space-x-4">
      <a
        href="https://facebook.com"
        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="Facebook"
      >
        <FaFacebookF className="w-5 h-5" />
      </a>
      <a
        href="https://twitter.com"
        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="Twitter"
      >
        <FaTwitter className="w-5 h-5" />
      </a>
      <a
        href="https://instagram.com"
        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="Instagram"
      >
        <FaInstagram className="w-5 h-5" />
      </a>
      <a
        href="https://linkedin.com"
        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="LinkedIn"
      >
        <FaLinkedin className="w-5 h-5" />
      </a>
    </div>
  );
}

function CopyrightSection() {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
          &copy; 2024 NEXTHREADS. All rights reserved.
        </p>
        <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <a
            href="/terms"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full border dark:border-none border-slate-100 shadow-lg text-white py-6 bg-inherit dark:bg-inherit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <BrandSection />
            <NavLinks />
            <SocialLinks />
          </div>
        </div>
        <CopyrightSection />
      </div>
    </footer>
  );
}

export default Footer;
