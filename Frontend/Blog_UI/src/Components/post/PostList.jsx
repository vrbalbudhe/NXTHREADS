import { FileText } from "lucide-react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { EmptyState, ErrorNote, LoadMore } from "../ui/Feedback";
import PostCard, { PostCardSkeleton } from "./PostCard";

export default function PostList({ feed, empty, skeletons = 3 }) {
  const sentinel = useInfiniteScroll(feed.loadMore, feed.hasMore && !feed.loading);

  if (feed.loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletons }, (_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (feed.error && feed.items.length === 0) {
    return <ErrorNote message={feed.error} onRetry={feed.reload} />;
  }

  if (feed.items.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={empty?.icon || FileText}
          title={empty?.title || "Nothing here yet"}
          description={empty?.description}
          action={empty?.action}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feed.items.map((post) => (
        <PostCard key={post.id} post={post} onChange={feed.updateItem} onRemove={feed.removeItem} />
      ))}
      <LoadMore
        sentinelRef={sentinel}
        loadingMore={feed.loadingMore}
        hasMore={feed.hasMore}
        onLoadMore={feed.loadMore}
      />
    </div>
  );
}
