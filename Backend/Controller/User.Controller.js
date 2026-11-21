const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");
const { isObjectId, cleanString, isHttpUrl, invalidId } = require("../lib/validators");
const { sessionCookieOptions } = require("../Config/env");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MAX_FULLNAME_LENGTH = 60;
const MAX_GENDER_LENGTH = 30;

const profileSelect = (includeEmail) => ({
  ...publicUserSelect,
  gender: true,
  verified: true,
  createdAt: true,
  ...(includeEmail && { email: true }),
  savedPosts: true,
  followers: true,
  following: true,
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }

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
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { ...publicUserSelect, followers: true },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({ user });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ select: publicUserSelect });
  return res.status(200).json({ users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "You can only delete your own account" });
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password) {
    return res.status(400).json({ success: false, message: "Enter your password to delete your account" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, password: true },
  });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
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
      await tx.otp.deleteMany({ where: { email: user.email } });
      await tx.user.delete({ where: { id } });
    },
    { timeout: 30000 }
  );

  res.clearCookie("token", sessionCookieOptions);
  return res.status(200).json({ success: true, message: "Your account has been deleted" });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "You can only update your own profile" });
  }

  const { fullname, gender, avatar, password, currentPassword } = req.body ?? {};
  const updatedFields = {};

  if (fullname !== undefined) {
    const value = cleanString(fullname);
    if (value.length > MAX_FULLNAME_LENGTH) {
      return res.status(400).json({ success: false, message: "Full name is too long" });
    }
    updatedFields.fullname = value;
  }

  if (gender !== undefined) {
    const value = cleanString(gender);
    if (value.length > MAX_GENDER_LENGTH) {
      return res.status(400).json({ success: false, message: "Gender is too long" });
    }
    updatedFields.gender = value;
  }

  if (avatar !== undefined) {
    const value = cleanString(avatar);
    if (value && !isHttpUrl(value)) {
      return res.status(400).json({ success: false, message: "Avatar must be an http(s) URL" });
    }
    updatedFields.avatar = value;
  }

  if (typeof password === "string" && password !== "") {
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`,
      });
    }
    if (typeof currentPassword !== "string" || currentPassword === "") {
      return res.status(400).json({
        success: false,
        message: "Enter your current password to set a new one",
      });
    }
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

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

module.exports = {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserFollowStatus,
};
