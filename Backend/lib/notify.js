const prisma = require("./prisma");
const { publicUserSelect } = require("./selects");
const { emitToUser } = require("./realtime");

const PREVIEW_LENGTH = 140;

const notificationInclude = {
  actor: { select: publicUserSelect },
  post: { select: { id: true, title: true } },
};

const unreadCount = (userId) => prisma.notification.count({ where: { userId, read: false } });

const notify = async ({ type, userId, actorId, postId, commentId, preview }) => {
  if (!userId || !actorId || userId === actorId) return null;

  try {
    if (type !== "COMMENT") {
      const existing = await prisma.notification.findFirst({
        where: { type, userId, actorId, ...(postId && { postId }) },
        select: { id: true },
      });
      if (existing) return null;
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        userId,
        actorId,
        ...(postId && { postId }),
        ...(commentId && { commentId }),
        ...(preview && { preview: preview.slice(0, PREVIEW_LENGTH) }),
      },
      include: notificationInclude,
    });

    emitToUser(userId, "notification:new", {
      notification,
      unread: await unreadCount(userId),
    });
    return notification;
  } catch (error) {
    console.error(`Failed to create notification: ${error.message}`);
    return null;
  }
};

module.exports = { notify, unreadCount, notificationInclude };
