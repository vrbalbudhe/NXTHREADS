import { IoMdSearch } from "react-icons/io";

function SearchBar({ value, onChange }) {
  return (
    <form
      className="flex w-full justify-center gap-2 items-center"
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="w-[100%] h-10 border pl-5 dark:text-white dark:outline-none dark:bg-darkPostCardBg dark:border-gray-700 dark:border border-gray-300 rounded-2xl"
        type="search"
        maxLength={100}
        placeholder="Search posts, authors or people"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search"
      />
      <button
        type="submit"
        aria-label="Search"
        className="py-2 text-xl dark:border-none bg-blue-500 dark:text-white text-black rounded-md shadow-xl border border-slate-300 px-2 hover:text-white hover:bg-slate-500"
      >
        <IoMdSearch />
      </button>
    </form>
  );
}

export default SearchBar;
