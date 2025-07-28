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
    <div className="w-full h-fit select-none">
      <div className="w-full flex flex-wrap justify-start items-start gap-2">
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => navigate(`/list?category=${category}&author=`)}
            className="dark:text-white dark:bg-darkPostCardBackground dark:border px-2 py-4 cursor-pointer rounded-2xl border hover:border-sky-400 border-gray-400 dark:border-gray-600"
          >
            <h3 className="text-xs font-semibold hover:text-blue-400">
              {category}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HotTopicsCard;
