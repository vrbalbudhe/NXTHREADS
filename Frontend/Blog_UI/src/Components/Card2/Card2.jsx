function Card2() {
  const categories = [
    "Entrepreneurship",
    "Design",
    "Gaming",
    "Health and Wellness",
    "Travel",
    "Food and Cooking",
    "Fashion",
    "Photography",
    "Sports",
    "Personal Development",
    "Technology",
    "Programming",
    "Web Development",
    "Mobile Development",
    "Software Engineering",
    "Data Science",
    "Cybersecurity",
    "Cloud Computing",
    "Blockchain",
    "Digital Marketing",
  ];
  return (
    <div className="w-full h-20 flex flex-wrap justify-between items-center gap-2">
      {categories.map((category, index) => (
        <div
          className="w-full cursor-pointer font-bold hover:text-white hover:bg-blue-400 text-nowrap border border-slate-300 rounded-md text-slate-800 px-2 py-2"
          key={index}
        >
          <h3 className="text-xs font-semibold">{category}</h3>
        </div>
      ))}
    </div>
  );
}

export default Card2;
