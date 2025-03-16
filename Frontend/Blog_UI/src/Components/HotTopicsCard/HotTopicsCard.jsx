import { useNavigate } from "react-router-dom";

// Define categories
const categories = [
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
];

function HotTopicsCard() {
  const navigate = useNavigate("");
  return (
    <div className="w-full h-fit">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2">
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => navigate(`/list?category=${category}&author=`)}
            className="dark:text-white text-gray-800 dark:bg-gray-800 dark:border-none px-3 py-4 cursor-pointer rounded-md border-2 hover:text-white hover:border-blue-400 hover:bg-blue-400 border-slate-200 transition-shadow duration-300"
          >
            <h3 className="text-xs font-semibold">{category}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HotTopicsCard;
