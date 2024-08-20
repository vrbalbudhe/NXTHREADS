/* eslint-disable react/prop-types */
import { FaAngleDoubleDown } from "react-icons/fa";
function ViewMore({ onViewMore }) {
  return (
    <div className="w-full h-12 bg-white rounded-sm flex justify-center items-center">
      <div className="ml-2 text-xs ">
        <button
          onClick={onViewMore}
          className="px-2 py-1 hover:text-slate-700 text-xl rounded-md font-semibold text-slate-800"
        >
          <FaAngleDoubleDown />
        </button>
      </div>
    </div>
  );
}

export default ViewMore;
