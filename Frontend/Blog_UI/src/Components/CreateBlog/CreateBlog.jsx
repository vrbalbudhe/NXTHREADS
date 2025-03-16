import axios from "axios";
import { useContext, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import UploadWindow from "../UploadWindow/UploadWindow";

function CreateBlog() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [blogData, setBlogData] = useState({
    title: "",
    subtitle: "",
    category: "Technology", // Default category
    content: "",
    author: "",
  });

  const [imageUrls, setImageUrls] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prevData) => ({
      ...prevData,
      [name]: value,
      author: currentUser.username,
    }));
  };

  const handleCreateBlog = async () => {
    try {
      const postData = {
        ...blogData,
        images: imageUrls, // Adding image URLs to the post data
      };

      const res = await axios.post(
        "http://localhost:8000/api/post/",
        postData,
        {
          withCredentials: true,
        }
      );
      console.log("Blog post created successfully:", res.data);
      navigate(`/profile/${currentUser.userInfo.id}`);
    } catch (error) {
      console.error("Error creating blog post:", error);
      // Handle error, show error message to user
    }
  };

  return (
    <div className="w-full h-full flex justify-start items-start">
      <div className="w-full h-full flex justify-start items-start gap-2 mt-5">
        <div className="w-[30%] h-full gap-3 flex flex-col">
          <div className="w-full h-full border dark:text-darkBlue dark:bg-gray-800 border-slate-300 dark:border-slate-800 rounded-2xl shadow-md p-8 flex flex-col justify-start items-start gap-3">
            <h1>Upload Images </h1>
            <ul className="text-xs dark:text-white pl-4 list-decimal">
              <li>Camera</li>
              <li>Browse</li>
              <li>Drive</li>
              <li>istock</li>
              <li>Unsplash</li>
              <li>Dropbox</li>
              <li>Gettyimages</li>
              <li>Shutterstock</li>
              <li>PLease add the .mp4 video format for no Error</li>
              <li>Every Image Format is Supported </li>
            </ul>
            <h1 className="h-fit inline">
              <UploadWindow setImageUrls={setImageUrls} />
              <h1 className="inline-block pl-2 text-xs justify-end items-end">
                made with
                <span className="text-blue-900 font-semibold text-xs">
                  {" "}
                  Cloudinary SDK
                </span>
              </h1>
            </h1>
          </div>
          <div className="w-full h-full border dark:border dark:border-slate-800 dark:text-slate-300 dark:bg-gray-800 border-slate-300 rounded-2xl shadow-md p-8 flex flex-col justify-start items-start gap-3">
            <h1 className="font-bold text-blue-500">Important Rules</h1>
            <ul className="text-xs list-disc">
              <li>
                <strong>No Hate Speech:</strong> Avoid discriminatory or
                offensive language.
              </li>
              <li>
                <strong>No Explicit Content:</strong> Keep content free of
                graphic or explicit material.
              </li>
              <li>
                <strong>No Harassment:</strong> Refrain from threatening or
                harassing others.
              </li>
              <li>
                <strong>No Spam:</strong> Avoid irrelevant content and excessive
                self-promotion.
              </li>
              <li>
                <strong>Provide Accurate Information:</strong> Ensure factual
                accuracy and avoid misinformation.
              </li>
              <li>
                <strong>Respect Copyrights:</strong> Do not infringe on
                intellectual property rights.
              </li>
              <li>
                <strong>Protect Privacy:</strong> Do not share personal or
                confidential information.
              </li>
              <li>
                <strong>No Illegal Activities:</strong> Adhere to all applicable
                laws.
              </li>
              <li>
                <strong>Use Professional Language:</strong> Maintain a
                respectful tone.
              </li>
              <li>
                <strong>Engage Positively:</strong> Foster constructive and
                respectful interactions.
              </li>
            </ul>
          </div>
        </div>

        <div className="w-[70%] h-full border dark:border-none border-slate-300 rounded-2xl shadow-md p-5">
          <div className="w-full h-14 flex justify-between items-center pl-5">
            <h1 className="font-semibold text-slate-900 text-sm md:text-2xl dark:text-white">
              Write a Blog
            </h1>
            <button
              className=" border border-slate-400 px-2 mr-5 py-1 text-xs rounded-lg dark:text-darkText hover:bg-blue-400 hover:text-white text-slate-800 font-bold"
              onClick={handleCreateBlog}
            >
              Post It
            </button>
          </div>
          <div className="w-full h-fit flex justify-start items-center pl-5">
            <div className="w-full h-fit flex flex-col justify-start items-start gap-2">
              <div>
                <input
                  className="w-[690px] h-10 border-2 dark:text-white outline-none dark:bg-gray-800 rounded-lg dark:border-slate-800 dark:border border-slate-200 pl-2 text-xs"
                  placeholder="Title"
                  type="text"
                  name="title"
                  value={blogData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  className="w-[690px] h-10 border-2 dark:text-darkText outline-none dark:bg-gray-800 rounded-lg dark:border-slate-800 border-slate-200 pl-2 text-xs"
                  placeholder="Subtitle"
                  type="text"
                  name="subtitle"
                  value={blogData.subtitle}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <select
                  className="pl-2 w-[200px] min-h-10  dark:bg-gray-800 outline-none dark:border-slate-800 rounded-lg dark:text-white bg-white border-2 text-xs border-slate-200"
                  name="category"
                  value={blogData.category}
                  onChange={handleInputChange}
                >
                  <option value="Technology">Technology</option>
                  <option value="Programming">Programming</option>
                  <option value="Web_Development">Web Development</option>
                  <option value="Mobile_Development">Mobile Development</option>
                  <option value="Software_Engineering">
                    Software Engineering
                  </option>
                  <option value="Data_Science">Data Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud_Computing">Cloud Computing</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Digital_Marketing">Digital Marketing</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Design">Design</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Health_and_Wellness">
                    Health and Wellness
                  </option>
                  <option value="Travel">Travel</option>
                  <option value="Food_and_Cooking">Food and Cooking</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Photography">Photography</option>
                  <option value="Sports">Sports</option>
                  <option value="Personal_Development">
                    Personal Development
                  </option>
                </select>
              </div>
              <div className="w-full h-[300px] overflow-hidden">
                <textarea
                  className="h-full w-full pl-2 dark:text-darkText outline-none dark:bg-gray-800 rounded-lg dark:border-slate-800 border border-slate-300 text-sm pt-2"
                  placeholder="Write a Post..."
                  name="content"
                  value={blogData.content}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateBlog;
