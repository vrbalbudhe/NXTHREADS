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
    <div className="w-full h-fit p-4 rounded-lg">
      <h2 className="text-md font-bold mb-4 text-slate-900">Hot Topics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-1">
        {categories.map((category, index) => (
          <div
            key={index}
            onClick={() => navigate(`/list?category=${category}&author=`)}
            className="bg-white p-3 cursor-pointer rounded-lg border hover:text-white hover:bg-blue-400 text-slate-800 border-slate-200 transition-shadow duration-300"
          >
            <h3 className="text-xs font-semibold">{category}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HotTopicsCard;
