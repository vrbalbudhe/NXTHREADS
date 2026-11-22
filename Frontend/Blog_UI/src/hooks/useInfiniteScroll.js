import { useEffect, useRef } from "react";

export const useInfiniteScroll = (onLoadMore, enabled) => {
  const ref = useRef(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callbackRef.current?.();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
};
