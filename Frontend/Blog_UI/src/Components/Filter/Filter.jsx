import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const categories = [
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
];

function Filter({ users }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState({
    category: searchParams.get("category") || "",
    author: searchParams.get("author") || "",
  });

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

  return (
    <div className="w-full h-fit dark:border-none flex flex-col mt-10 rounded-md justify-center items-center gap-2">
      <select
        className=" w-full text-xs pl-2 font-semibold dark:text-white dark:bg-darkPostCardBg text-slate-700 h-12 rounded-md border border-gray-200 dark:border-gray-200"
        name="category"
        value={query.category}
        onChange={handleInputChange}
      >
        {categories.map((category) => (
          <option className="" value="">
            {category}
          </option>
        ))}
      </select>
      <select
        className="pl-2 w-full text-xs font-semibold dark:bg-darkPostCardBg text-slate-700 min-h-12 dark:text-white rounded-lg border border-gray-200 dark:border-gray-200"
        name="author"
        value={query.author}
        onChange={handleInputChange}
      >
        <option value="">Select an author</option>
        {Array.isArray(users) &&
          users.map((user) => (
            <option key={user.id} value={user.username}>
              {user.fullname}
            </option>
          ))}
      </select>

      <button
        onClick={handleFilter}
        className="w-full h-12 rounded-md bg-blue-500 text-white font-semibold"
      >
        Filter
      </button>
    </div>
  );
}

export default Filter;
