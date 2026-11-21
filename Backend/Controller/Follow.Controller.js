const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");
const { isObjectId, invalidId } = require("../lib/validators");

const followUnfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.userId;
  const followingId = req.body?.followingId;

  if (!isObjectId(followingId)) {
    return invalidId(res, "user id");
  }
  if (followingId === followerId) {
    return res.status(400).json({ success: false, message: "You cannot follow yourself" });
  }

  const target = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true },
  });
  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const key = { followerId_followingId: { followerId, followingId } };
  const existingFollow = await prisma.follows.findUnique({ where: key });

  if (existingFollow) {
    await prisma.follows.delete({ where: key });
    return res.status(200).json({ success: true, message: "Unfollowed successfully" });
  }

  const followSuccess = await prisma.follows.create({ data: { followerId, followingId } });
  return res.status(200).json({
    success: true,
    message: "Followed successfully",
    followSuccess,
  });
});

const checkIsFollwing = asyncHandler(async (req, res) => {
  const followingId = req.params.id;
  if (!isObjectId(followingId)) {
    return invalidId(res, "user id");
  }

  const followRecord = await prisma.follows.findUnique({
    where: { followerId_followingId: { followerId: req.userId, followingId } },
    select: { id: true },
  });

  return res.status(200).json({ isFollowing: Boolean(followRecord) });
});

const totalFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }

  const totalFollowings = await prisma.follows.findMany({
    where: { followerId: id },
    include: { following: { select: publicUserSelect } },
  });

  return res.status(200).json({ totalFollowings });
});

const totalFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }

  const totalFollowers = await prisma.follows.findMany({
    where: { followingId: id },
    include: { follower: { select: publicUserSelect } },
  });

  return res.status(200).json({ totalFollowers });
});

const isFollowing = asyncHandler(async (req, res) => {
  const { followerId, followingId } = req.query;
  if (!isObjectId(followerId) || !isObjectId(followingId)) {
    return invalidId(res, "user id");
  }

  const followRecord = await prisma.follows.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });

  return res.status(200).json({ isFollowing: Boolean(followRecord) });
});

module.exports = {
  totalFollowing,
  totalFollowers,
  followUnfollowUser,
  checkIsFollwing,
  isFollowing,
};
