/* eslint-disable no-unused-vars */
import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function Filter() {
  const [searchParams, setSearchParams] = useSearchParams();
  /*
   * if we console.log the searchParams -> returns the object containing the key and values of the url
   * example : URLSearchParams { category → "Technology", author → "John Doe" }
   * setSearchParams is the functions for setting the URL
   */

  const [query, setQuery] = useState({
    category: searchParams.get("category") || "",
    author: searchParams.get("author") || "",
  });

  const [users, setUsers] = useState([]);

  const handleFilter = () => {
    setSearchParams(query);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuery((prevQuery) => ({
      ...prevQuery,
      [name]: value,
    }));
  };

  /*
   * This is for getting the users
   */
  const handleGetUser = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/user/", {
        withCredentials: true,
      });
      setUsers(res.data.users.map((user) => user.username));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    handleGetUser();
  }, []);

  /*
   *Updating the Result found state
   */
  const [result, setResults] = useState(0);

  return (
    <div className="w-full h-fit dark:border-none flex flex-col mt-10 rounded-md justify-center items-center gap-2">
      <select
        className=" w-full text-xs pl-2 font-semibold dark:text-white dark:bg-gray-800 dark:border-none text-slate-700 h-10 rounded-md border-2 border-gray-200 bg-white"
        name="category"
        value={query.category}
        onChange={handleInputChange}
      >
        <option value="">{query.category}</option>
        <option value="Technology">Technology</option>
        <option value="Programming">Programming</option>
        <option value="Web_Development">Web Development</option>
        <option value="Mobile_Development">Mobile Development</option>
        <option value="Software_Engineering">Software Engineering</option>
        <option value="Data_Science">Data Science</option>
        <option value="Cybersecurity">Cybersecurity</option>
        <option value="Cloud_Computing">Cloud Computing</option>
        <option value="Blockchain">Blockchain</option>
        <option value="Digital_Marketing">Digital Marketing</option>
        <option value="Entrepreneurship">Entrepreneurship</option>
        <option value="Design">Design</option>
        <option value="Gaming">Gaming</option>
        <option value="Health_and_Wellness">Health and Wellness</option>
        <option value="Travel">Travel</option>
        <option value="Food_and_Cooking">Food and Cooking</option>
        <option value="Fashion">Fashion</option>
        <option value="Photography">Photography</option>
        <option value="Sports">Sports</option>
        <option value="Personal_Development">Personal Development</option>
      </select>
      <select
        className="pl-2 w-full text-xs font-semibold dark:border-none dark:bg-gray-800 text-slate-700 h-10 dark:text-white rounded-md border-2 border-gray-200 bg-white"
        name="author"
        value={query.username}
        onChange={handleInputChange}
      >
        <option value="">Select an author</option>
        {users.map((user, index) => (
          <option key={index} value={user}>
            {user}
          </option>
        ))}
      </select>
      <button
        onClick={handleFilter}
        className="w-full h-10 rounded-md bg-blue-400 text-white font-semibold"
      >
        Filter
      </button>
    </div>
  );
}

export default Filter;
