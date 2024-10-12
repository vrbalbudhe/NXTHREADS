/* eslint-disable react/prop-types */
function NextPrevious({ prev, next }) {
  return (
    <div className="w-full h-10 bg-white dark:bg-[#080708] rounded-sm flex justify-between items-center">
      <div className="ml-2 text-xs">
        <button
          onClick={prev}
          className="px-2 dark:border-none dark:text-white dark:font-base dark:text-sm py-1 hover:text-white hover:bg-blue-400 hover:border-none border-2 border-slate-300 rounded-md font-semibold text-slate-800"
        >
          Prev
        </button>
      </div>
      <div className="mr-2 text-xs">
        <button
          onClick={next}
          className="px-2 dark:border-none dark:text-white dark:font-base dark:text-sm py-1 hover:text-white hover:bg-blue-400 hover:border-none border-2 border-slate-300 rounded-md font-semibold text-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default NextPrevious;
