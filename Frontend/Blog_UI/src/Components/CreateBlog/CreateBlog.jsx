import axios from "axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import UploadWindow from "../UploadWindow/UploadWindow";

const UploadInstructions = ({ setImageUrls }) => (
  <div className="w-full h-full border dark:text-darkBlue dark:bg-darkPostCardBackground border-slate-300 dark:border-gray-700 rounded-2xl shadow-md p-8 flex flex-col justify-start items-start gap-3">
    <h1>Upload Images</h1>
    <ul className="text-xs dark:text-white pl-4 list-decimal">
      {[
        "Camera",
        "Browse",
        "Drive",
        "istock",
        "Unsplash",
        "Dropbox",
        "Gettyimages",
        "Shutterstock",
        "PLease add the .mp4 video format for no Error",
        "Every Image Format is Supported",
      ].map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
    <div className="flex items-end">
      <UploadWindow setImageUrls={setImageUrls} />
      <h1 className="inline-block pl-2 text-xs">
        made with{" "}
        <span className="text-blue-900 font-semibold">Cloudinary SDK</span>
      </h1>
    </div>
  </div>
);

const BlogRules = () => (
  <div className="w-full h-full border dark:border-gray-700 dark:text-slate-300 dark:bg-darkPostCardBackground border-slate-300 rounded-2xl shadow-md p-8 flex flex-col justify-start items-start gap-3">
    <h1 className="font-bold text-blue-500">Important Rules</h1>
    <ul className="text-xs list-disc">
      {[
        ["No Hate Speech", "Avoid discriminatory or offensive language."],
        [
          "No Explicit Content",
          "Keep content free of graphic or explicit material.",
        ],
        ["No Harassment", "Refrain from threatening or harassing others."],
        ["No Spam", "Avoid irrelevant content and excessive self-promotion."],
        [
          "Provide Accurate Information",
          "Ensure factual accuracy and avoid misinformation.",
        ],
        [
          "Respect Copyrights",
          "Do not infringe on intellectual property rights.",
        ],
        [
          "Protect Privacy",
          "Do not share personal or confidential information.",
        ],
        ["No Illegal Activities", "Adhere to all applicable laws."],
        ["Use Professional Language", "Maintain a respectful tone."],
        [
          "Engage Positively",
          "Foster constructive and respectful interactions.",
        ],
      ].map(([title, desc], i) => (
        <li key={i}>
          <strong>{title}:</strong> {desc}
        </li>
      ))}
    </ul>
  </div>
);

const LeftSideContainer = ({ setImageUrls }) => (
  <div className="w-full md:w-[25%] h-full gap-3 flex flex-col">
    <UploadInstructions setImageUrls={setImageUrls} />
    <BlogRules />
  </div>
);

const BlogForm = ({ blogData, handleInputChange }) => (
  <div className="w-full md:w-[75%] h-full border dark:border-none border-slate-300 rounded-2xl shadow-md">
    <div className="w-full h-14 flex justify-between items-center pl-5 pr-5">
      <h1 className="font-semibold text-slate-900 text-sm md:text-2xl dark:text-white">
        Write a Blog
      </h1>
      <button
        className="border border-slate-400 px-2 py-1 text-xs rounded-lg dark:text-darkText hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
        type="submit"
      >
        Post It
      </button>
    </div>

    <div className="w-full h-fit flex justify-start items-center md:pl-5 md:pr-5">
      <div className="w-full flex flex-col gap-3">
        <input
          className="w-full h-10 border dark:text-white dark:bg-darkPostCardBackground rounded-lg dark:border-slate-700 border-slate-200 pl-2 text-xs"
          placeholder="Title"
          name="title"
          value={blogData.title}
          onChange={handleInputChange}
        />
        <input
          className="w-full h-10 border dark:text-darkText dark:bg-darkPostCardBackground rounded-lg dark:border-slate-700 border-slate-200 pl-2 text-xs"
          placeholder="Subtitle"
          name="subtitle"
          value={blogData.subtitle}
          onChange={handleInputChange}
        />
        <select
          className="w-[200px] h-10 pl-2 dark:text-white dark:bg-darkPostCardBackground rounded-lg dark:border-gray-700 border text-xs border-slate-200"
          name="category"
          value={blogData.category}
          onChange={handleInputChange}
        >
          {[
            "Technology",
            "Programming",
            "Web_Development",
            "Mobile_Development",
            "Software_Engineering",
            "Data_Science",
            "Cybersecurity",
            "Cloud_Computing",
            "Blockchain",
            "Digital_Marketing",
            "Entrepreneurship",
            "Design",
            "Gaming",
            "Health_and_Wellness",
            "Travel",
            "Food_and_Cooking",
            "Fashion",
            "Photography",
            "Sports",
            "Personal_Development",
          ].map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <textarea
          className="h-[300px] w-full pl-2 dark:text-darkText dark:bg-darkPostCardBackground rounded-lg dark:border-gray-700 border border-slate-300 text-sm pt-2"
          placeholder="Write a Post..."
          name="content"
          value={blogData.content}
          onChange={handleInputChange}
        />
      </div>
    </div>
  </div>
);

function CreateBlog() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [imageUrls, setImageUrls] = useState([]);

  const [blogData, setBlogData] = useState({
    title: "",
    subtitle: "",
    category: "Technology",
    content: "",
    author: currentUser?.username || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({
      ...prev,
      [name]: value,
      author: currentUser?.username || "",
    }));
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${baseUrl}/api/post/`,
        { ...blogData, images: imageUrls },
        { withCredentials: true }
      );
      console.log("Blog post created:", res.data);
      console.log("Submitting blogData:", blogData);
      console.log("Submitting imageUrls:", imageUrls);
      navigate(`/profile/${currentUser?.userId}`);
    } catch (error) {
      console.error("Error creating blog:", error);
    }
  };

  return (
    <form className="w-full h-full p-2 md:p-0" onSubmit={handleCreateBlog}>
      <div className="w-full h-full flex flex-col-reverse gap-4 md:gap-0 md:flex-row justify-center items-start">
        <LeftSideContainer setImageUrls={setImageUrls} />
        <BlogForm blogData={blogData} handleInputChange={handleInputChange} />
      </div>
    </form>
  );
}

export default CreateBlog;
