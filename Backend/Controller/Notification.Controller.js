const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const { notificationInclude, unreadCount } = require("../lib/notify");
const { emitToUser } = require("../lib/realtime");

const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unread } = req.valid.query;
  const where = { userId: req.userId, ...(unread && { read: false }) };

  const [notifications, total, unreadTotal] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: notificationInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    unreadCount(req.userId),
  ]);

  return res.status(200).json({
    notifications,
    unread: unreadTotal,
    meta: { total, page, limit, hasMore: (page - 1) * limit + notifications.length < total },
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  return res.status(200).json({ unread: await unreadCount(req.userId) });
});

const markRead = asyncHandler(async (req, res) => {
  const { ids } = req.valid.body;
  await prisma.notification.updateMany({
    where: { userId: req.userId, read: false, ...(ids && { id: { in: ids } }) },
    data: { read: true },
  });
  const unread = await unreadCount(req.userId);
  emitToUser(req.userId, "notification:read", { ids: ids || null, unread });
  return res.status(200).json({ success: true, unread });
});

module.exports = { listNotifications, getUnreadCount, markRead };
