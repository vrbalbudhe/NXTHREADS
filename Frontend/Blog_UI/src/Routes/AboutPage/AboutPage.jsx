const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
      <div className="rounded-lg max-w-xl w-full p-1">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">About NEXTHREADS</h1>
        <p className="text-xs font-semibold  -tracking-tight text-gray-600 leading-7 mb-6">
          Welcome to NEXTHREADS, your go-to platform for creating, sharing, and discovering amazing content. Our mission is to empower creators by providing an intuitive and feature-rich platform that simplifies the process of content creation and distribution.
        </p>
        <p className="text-xs font-semibold  -tracking-tight text-gray-600 leading-7 mb-6">
          At NEXTHREADS, we believe that everyone has a story to tell, and we are here to help you tell yours. Whether you are a blogger, journalist, or simply someone with a passion for writing, our platform offers the tools and community you need to share your voice with the world.
        </p>
        <p className="text-xs font-semibold  -tracking-tight text-gray-600 leading-7 mb-6">
          Our features include a powerful text editor, customizable templates, and easy-to-use tools for embedding multimedia content. We are constantly updating and improving our platform to ensure that you have the best possible experience.
        </p>
        <p className="text-xs font-semibold  -tracking-tight text-gray-600 leading-7 mb-6">
          Join our vibrant community of creators today and start making your posts with Make My Post. Together, lets create something amazing.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="/register"
            className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-semibold hover:bg-blue-500 transition duration-200"
          >
            Join Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
