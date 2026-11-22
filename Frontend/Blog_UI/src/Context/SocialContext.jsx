import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "../lib/api";
import { useAuth } from "./AuthContext";

const SocialContext = createContext(null);

export function SocialProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.userId;
  const [following, setFollowing] = useState(() => new Set());
  const [pending, setPending] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFollowing(new Set());
    setReady(false);
    if (!userId) {
      return undefined;
    }
    api
      .get(`/userfollow/following/${userId}`)
      .then((res) => {
        if (!cancelled) {
          const ids = (res.data?.totalFollowings || []).map(
            (row) => row.following?.id || row.followingId
          );
          setFollowing(new Set(ids.filter(Boolean)));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isFollowing = useCallback((id) => following.has(id), [following]);

  const toggleFollow = useCallback(
    async (targetId) => {
      if (!userId || !targetId || pending.has(targetId)) return null;
      const wasFollowing = following.has(targetId);
      const apply = (follow) =>
        setFollowing((previous) => {
          const next = new Set(previous);
          if (follow) next.add(targetId);
          else next.delete(targetId);
          return next;
        });

      setPending((previous) => new Set(previous).add(targetId));
      apply(!wasFollowing);
      try {
        await api.post("/userfollow/follow", { followingId: targetId });
        return !wasFollowing;
      } catch (error) {
        apply(wasFollowing);
        throw new Error(errorMessage(error, "Could not update follow"));
      } finally {
        setPending((previous) => {
          const next = new Set(previous);
          next.delete(targetId);
          return next;
        });
      }
    },
    [userId, following, pending]
  );

  const value = useMemo(
    () => ({
      ready,
      followingCount: following.size,
      isFollowing,
      isPending: (id) => pending.has(id),
      toggleFollow,
    }),
    [ready, following, isFollowing, pending, toggleFollow]
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export const useSocial = () => useContext(SocialContext);
