/* eslint-disable react/prop-types */
function NextPrevious({ prev, next }) {
  return (
    <div className="w-full h-10 bg-white dark:bg-[#01161e] rounded-sm flex justify-between items-center">
      <div className="ml-2 text-xs">
        <button
          onClick={prev}
          className="px-4 dark:border-none dark:text-white dark:font-base dark:text-sm py-3 hover:text-white hover:bg-gray-800 hover:border-none border-2 border-slate-300 rounded-xl font-semibold text-slate-800"
        >
          Prev
        </button>
      </div>
      <div className="mr-2 text-xs">
        <button
          onClick={next}
          className="px-4 dark:border-none dark:text-white dark:font-base dark:text-sm py-3 hover:text-white hover:bg-gray-800 hover:border-none border-2 border-slate-300 rounded-xl font-semibold text-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default NextPrevious;
