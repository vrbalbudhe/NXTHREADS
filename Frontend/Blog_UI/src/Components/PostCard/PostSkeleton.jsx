import { Heart, HeartOff, MessageCircle } from "lucide-react";

export default function PostSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-4 p-2 border dark:border-gray-700 border-gray-400 rounded-2xl shadow">
      <div className="border-b p-2 flex justify-start items-center gap-4 h-14 dark:border-gray-700 border-gray-400">
        <p className="w-8 h-8 rounded-full dark:bg-gray-600 bg-gray-700"></p>
        <div className="w-2/5 flex flex-col gap-2">
          <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="h-6 w-1/3 bg-gray-500 rounded"></div>
      <div className="h-4 w-2/3 bg-gray-600 rounded"></div>
      <div className="h-4 w-full bg-slate-700 rounded"></div>
      <div className="h-4 w-full bg-slate-700 rounded"></div>
      <div className="w-full h-10 border-t dark:border-gray-700 border-gray-400 flex justify-between items-center">
        <div className="w-full flex gap-2">
          <Heart className="w-5 h-5    dark:text-gray-400 text-gray-700" />
          <HeartOff className="w-5 h-5 dark:text-gray-400 text-gray-700" />
        </div>
        <MessageCircle className="w-5 h-5 dark:text-gray-400 text-gray-700" />
      </div>
    </div>
  );
}
