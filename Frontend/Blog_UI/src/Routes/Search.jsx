import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import Filter from "../Components/LayoutComponents/Filter";
import PostCard from "../Components/PostCard/PostCard";
import HotTopicsCard from "../Components/UI_Components/HotTopicsCard";
import SearchBar from "../Components/SearchBar/SearchBar";
import UserCard from "../Components/UserCard/UserCard";
import { useFetchPosts } from "../Loaders/posts/useFetchAllPosts";
import { useSearch } from "../hooks/useSearch";
import { AuthContext } from "../Context/AuthContext";
import ShowcaseBanner from "../Components/UI_Components/ShowcaseBanner";
import PostSkeleton from "../Components/PostCard/PostSkeleton";

function LoadMoreButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="self-center text-sm font-semibold px-4 py-2 rounded-xl border border-slate-300 dark:border-gray-700 dark:text-white disabled:opacity-50"
    >
      {loading ? "Loading..." : "Load more"}
    </button>
  );
}

function Search() {
  const { currentUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const latest = useFetchPosts();
  const results = useSearch(query, { includeUsers: Boolean(currentUser?.userId) });
  const isSearching = query.trim().length > 0;
  const { loadPosts } = latest;

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setSearchParams(value.trim() ? { q: value.trim() } : {}, { replace: true });
  };

  const posts = isSearching ? results.posts : latest.posts;
  const loading = isSearching ? results.loading : latest.loading;
  const hasMore = isSearching ? results.hasMore : latest.hasMore;
  const loadingMore = isSearching ? results.loadingMore : latest.loadingMore;
  const loadMore = isSearching ? results.loadMore : latest.loadMore;

  return (
    <div className="w-full min-h-screen md:flex justify-start items-start mt-5 gap-2">
      <div className="w-full md:w-[20%] h-full hidden md:flex flex-col gap-5 justify-center items-start">
        <HotTopicsCard />
      </div>

      <div className="w-full md:w-[60%] h-full p-1 flex flex-col justify-start gap-3 items-start">
        <SearchBar value={query} onChange={handleQueryChange} />
        <div className="md:hidden block">
          <HotTopicsCard />
        </div>

        {isSearching && results.error && <p className="text-sm text-red-500">{results.error}</p>}

        {isSearching && results.users.length > 0 && (
          <div className="w-full flex flex-wrap justify-start items-center gap-2">
            {results.users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}

        <div className="w-full h-fit flex flex-col gap-3">
          {loading ? (
            [...Array(3)].map((_, index) => <PostSkeleton key={index} />)
          ) : posts.length === 0 ? (
            <div className="w-full min-h-[300px] flex justify-center items-center">
              <p className="text-lg dark:text-white text-gray-800">
                {isSearching ? `No posts match "${query.trim()}"` : "No posts found"}
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={currentUser} />
              ))}
              {hasMore && <LoadMoreButton onClick={loadMore} loading={loadingMore} />}
            </>
          )}
        </div>
      </div>

      <div className="w-full md:w-[20%] h-full hidden md:flex flex-col gap-5 justify-center items-start">
        <Filter />
        <ShowcaseBanner
          title="Discover Top Blogs"
          navigateTo="/search"
          imageUrl="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
      </div>
    </div>
  );
}

export default Search;
