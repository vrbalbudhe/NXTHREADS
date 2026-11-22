import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage, invalidateCache } from "../lib/api";
import { useAuth } from "../Context/AuthContext";
import { useShellTitle } from "../Components/layout/ShellContext";
import Breadcrumbs from "../Components/ui/Breadcrumbs";
import { EmptyState, ErrorNote, Skeleton } from "../Components/ui/Feedback";
import PostForm from "../Components/post/PostForm";

export function WritePost() {
  const navigate = useNavigate();
  useShellTitle("Write");

  const create = async (draft) => {
    try {
      const res = await api.post("/post", draft);
      invalidateCache("/post/stats");
      invalidateCache("/post/categories");
      toast.success("Published");
      navigate(`/post/${res.data.post.id}`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not publish"));
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Write a post" }]} />
      <PostForm submitLabel="Publish" onSubmit={create} onCancel={() => navigate(-1)} />
    </div>
  );
}

export function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  useShellTitle("Edit post");

  useEffect(() => {
    api
      .get(`/post/get/${id}`)
      .then((res) => setPost(res.data.post))
      .catch((err) => setError(errorMessage(err, "Unable to load this post")));
  }, [id]);

  const save = async (draft) => {
    try {
      await api.put(`/post/upd/${id}`, draft);
      invalidateCache("/post/categories");
      toast.success("Changes saved");
      navigate(`/post/${id}`);
    } catch (err) {
      toast.error(errorMessage(err, "Could not save changes"));
    }
  };

  if (error) return <ErrorNote message={error} />;
  if (!post) return <Skeleton className="h-96 w-full rounded-xl2" />;
  if (post.userId !== currentUser?.userId) {
    return (
      <div className="card">
        <EmptyState
          icon={Lock}
          title="You can only edit your own posts"
          action={
            <Link to={`/post/${id}`} className="btn btn-primary">
              View post
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: post.title, to: `/post/${id}` }, { label: "Edit" }]} />
      <PostForm
        initial={post}
        submitLabel="Save changes"
        onSubmit={save}
        onCancel={() => navigate(`/post/${id}`)}
      />
    </div>
  );
}
