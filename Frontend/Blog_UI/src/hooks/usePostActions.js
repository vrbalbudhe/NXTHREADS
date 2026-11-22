import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, errorMessage, invalidateCache } from "../lib/api";
import { useAuth } from "../Context/AuthContext";

export const usePostActions = (post, onChange) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reacting, setReacting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const requireLogin = useCallback(() => {
    if (currentUser) return true;
    toast.info("Sign in to do that");
    navigate("/login");
    return false;
  }, [currentUser, navigate]);

  const react = useCallback(
    async (kind) => {
      if (!requireLogin() || reacting) return;
      setReacting(kind);
      try {
        const res = await api.post(kind === "like" ? "/post/like" : "/post/unlike", {
          postId: post.id,
        });
        onChange?.(post.id, (item) => ({
          likes: res.data.likes,
          unlikes: res.data.unlikes,
          viewer: { ...item.viewer, liked: res.data.isLiked, disliked: res.data.isUnliked },
        }));
      } catch (error) {
        toast.error(errorMessage(error, "Could not save your reaction"));
      } finally {
        setReacting(null);
      }
    },
    [requireLogin, reacting, post.id, onChange]
  );

  const setSaved = useCallback(
    (value) =>
      onChange?.(post.id, (item) => ({ viewer: { ...item.viewer, saved: value } }), {
        saved: value,
      }),
    [onChange, post.id]
  );

  const toggleSave = useCallback(async () => {
    if (!requireLogin() || saving) return;
    const next = !post.viewer?.saved;
    setSaving(true);
    setSaved(next);
    try {
      const res = await api.post("/post/fav", { postId: post.id });
      if (res.data.saved !== next) setSaved(res.data.saved);
      toast.success(res.data.saved ? "Saved to your list" : "Removed from saved");
    } catch (error) {
      setSaved(!next);
      toast.error(errorMessage(error, "Could not update saved posts"));
    } finally {
      setSaving(false);
    }
  }, [requireLogin, saving, post.id, post.viewer?.saved, setSaved]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (error) {
      if (error?.name !== "AbortError") toast.error("Could not share this post");
    }
  }, [post.id, post.title]);

  const remove = useCallback(async () => {
    setDeleting(true);
    try {
      await api.delete(`/post/${post.id}`);
      invalidateCache("/post/stats");
      invalidateCache("/post/categories");
      toast.success("Post deleted");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete the post"));
      return false;
    } finally {
      setDeleting(false);
    }
  }, [post.id]);

  return {
    busy: deleting ? "delete" : saving ? "save" : reacting,
    reacting,
    saving,
    deleting,
    isOwner: currentUser?.userId === post.userId,
    like: () => react("like"),
    dislike: () => react("dislike"),
    toggleSave,
    share,
    remove,
  };
};
