const paragraphs = [
  "Welcome to NEXTHREADS, your go-to platform for creating, sharing, and discovering amazing content. Our mission is to empower creators by providing an intuitive and feature-rich platform that simplifies the process of content creation and distribution.",
  "At NEXTHREADS, we believe that everyone has a story to tell, and we are here to help you tell yours. Whether you are a blogger,journalist, or simply someone with a passion for writing, our platform offers the tools and community you need to share your voice with the world.",
  "Our features include a powerful text editor, customizable templates, and easy-to-use tools for embedding multimedia content. We are constantly updating and improving our platform to ensure that you have the best possible experience.",
  "  Join our vibrant community of creators today and start making your posts with Make My Post. Together, lets create something amazing.",
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
      <div className="rounded-lg max-w-xl w-full p-1">
        <h1 className="text-2xl font-semibold text-center dark:text-white text-gray-800 mb-8">
          ABOUT NEXTHREADS
        </h1>
        {paragraphs.map((para) => (
          <p
            key={para}
            className="text-md font-medium -tracking-tight text-gray-500 leading-7 mb-6"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;
