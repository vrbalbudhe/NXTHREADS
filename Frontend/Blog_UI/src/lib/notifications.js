import { displayName } from "./format";

export const notificationText = (notification) => {
  const actor = displayName(notification.actor);
  const title = notification.post?.title || notification.preview;
  switch (notification.type) {
    case "LIKE":
      return `${actor} liked your post${title ? ` “${title}”` : ""}`;
    case "COMMENT":
      return `${actor} commented: “${notification.preview || ""}”`;
    case "FOLLOW":
      return `${actor} started following you`;
    default:
      return `${actor} interacted with you`;
  }
};

export const notificationLink = (notification) => {
  if (notification.type === "FOLLOW") return `/profile/${notification.actorId}`;
  if (notification.type === "COMMENT") return `/post/${notification.postId}#discussion`;
  return notification.postId ? `/post/${notification.postId}` : `/profile/${notification.actorId}`;
};
