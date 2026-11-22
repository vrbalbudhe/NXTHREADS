const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");
const { containsText } = require("../lib/text");
const { issueSession, clearSessionCookie, revokeAllSessions } = require("../lib/session");

const SEARCH_RESULT_LIMIT = 20;

const profileSelect = (includeEmail) => ({
  ...publicUserSelect,
  gender: true,
  verified: true,
  createdAt: true,
  ...(includeEmail && { email: true }),
  followers: { select: { followerId: true } },
  following: { select: { followingId: true } },
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.valid.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: profileSelect(id === req.userId),
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({ user });
});

const getUserFollowStatus = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.valid.params.id },
    select: { ...publicUserSelect, followers: true },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({ user });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { verified: true },
    select: publicUserSelect,
  });
  return res.status(200).json({ users });
});

const searchUsers = asyncHandler(async (req, res) => {
  const contains = containsText(req.valid.query.q);

  const users = await prisma.user.findMany({
    where: {
      verified: true,
      OR: [{ username: contains }, { fullname: contains }],
    },
    select: publicUserSelect,
    take: SEARCH_RESULT_LIMIT,
  });

  return res.status(200).json({ users });
});

const ensureSelf = (req, res, action) => {
  if (req.valid.params.id === req.userId) {
    return true;
  }
  res.status(403).json({ success: false, message: `You can only ${action} your own account` });
  return false;
};

const deleteUser = asyncHandler(async (req, res) => {
  if (!ensureSelf(req, res, "delete")) {
    return undefined;
  }
  const { id } = req.valid.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, password: true },
  });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (!(await bcrypt.compare(req.valid.body.password, user.password))) {
    return res.status(401).json({ success: false, message: "Password is incorrect" });
  }

  await prisma.$transaction(
    async (tx) => {
      const ownPosts = await tx.posts.findMany({ where: { userId: id }, select: { id: true } });
      const ownPostIds = ownPosts.map((post) => post.id);

      const [likes, unlikes] = await Promise.all([
        tx.like.findMany({
          where: { userId: id, postId: { notIn: ownPostIds } },
          select: { postId: true },
        }),
        tx.unlike.findMany({
          where: { userId: id, postId: { notIn: ownPostIds } },
          select: { postId: true },
        }),
      ]);

      if (likes.length > 0) {
        await tx.posts.updateMany({
          where: { id: { in: likes.map((like) => like.postId) } },
          data: { likes: { decrement: 1 } },
        });
      }
      if (unlikes.length > 0) {
        await tx.posts.updateMany({
          where: { id: { in: unlikes.map((unlike) => unlike.postId) } },
          data: { unlikes: { decrement: 1 } },
        });
      }

      const postScope = { postId: { in: ownPostIds } };
      await tx.comment.deleteMany({ where: { OR: [{ commentor: id }, postScope] } });
      await tx.like.deleteMany({ where: { OR: [{ userId: id }, postScope] } });
      await tx.unlike.deleteMany({ where: { OR: [{ userId: id }, postScope] } });
      await tx.savedPosts.deleteMany({ where: { OR: [{ userId: id }, postScope] } });
      await tx.posts.deleteMany({ where: { userId: id } });
      await tx.follows.deleteMany({ where: { OR: [{ followerId: id }, { followingId: id }] } });
      await tx.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
      await tx.chat.deleteMany({ where: { participants: { has: id } } });
      await tx.notification.deleteMany({
        where: { OR: [{ userId: id }, { actorId: id }, postScope] },
      });
      await tx.otp.deleteMany({ where: { email: user.email } });
      await tx.user.delete({ where: { id } });
    },
    { timeout: 30000 }
  );

  await revokeAllSessions(id);
  clearSessionCookie(res);
  return res.status(200).json({ success: true, message: "Your account has been deleted" });
});

const updateUser = asyncHandler(async (req, res) => {
  if (!ensureSelf(req, res, "update")) {
    return undefined;
  }
  const { id } = req.valid.params;
  const { fullname, gender, avatar, password, currentPassword } = req.valid.body;

  const updatedFields = {
    ...(fullname !== undefined && { fullname }),
    ...(gender !== undefined && { gender }),
    ...(avatar !== undefined && { avatar }),
  };

  if (password) {
    const existing = await prisma.user.findUnique({ where: { id }, select: { password: true } });
    const matches = existing && (await bcrypt.compare(currentPassword, existing.password));
    if (!matches) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    updatedFields.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updatedFields,
    select: { ...publicUserSelect, gender: true, email: true, verified: true },
  });

  if (password) {
    await revokeAllSessions(id);
    issueSession(res, updatedUser);
  }

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

module.exports = {
  getUser,
  getUsers,
  searchUsers,
  updateUser,
  deleteUser,
  getUserFollowStatus,
};
