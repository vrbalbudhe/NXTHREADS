const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");
const { isObjectId, cleanString, isHttpUrl, invalidId } = require("../lib/validators");

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

const deleteUser = (req, res) =>
  res.status(501).json({
    success: false,
    message: "Account deletion is not available yet",
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
