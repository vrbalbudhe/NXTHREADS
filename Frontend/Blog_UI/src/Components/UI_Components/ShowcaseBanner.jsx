import { useNavigate } from "react-router-dom";

function ShowcaseBanner({
  title = "Explore Trending Topics",
  subtitle = "Click to explore more",
  imageUrl,
  navigateTo = "/explore",
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(navigateTo)}
      className="w-full h-[250px] cursor-pointer select-none hidden md:block"
    >
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg group border dark:border-gray-700">
        <img
          src={
            imageUrl ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          }
          alt="Showcase"
          className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-white text-2xl font-bold mb-2">{title}</h1>
          <p className="text-white text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default ShowcaseBanner;
