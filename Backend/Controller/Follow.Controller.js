const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");
const { notify } = require("../lib/notify");
const { forgetUser } = require("../lib/recommend");

const followUnfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.userId;
  const { followingId } = req.valid.body;

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
  await forgetUser(followerId);

  if (existingFollow) {
    await prisma.follows.delete({ where: key });
    return res.status(200).json({ success: true, message: "Unfollowed successfully" });
  }

  const followSuccess = await prisma.follows.create({ data: { followerId, followingId } });
  await notify({ type: "FOLLOW", userId: followingId, actorId: followerId });
  return res.status(200).json({
    success: true,
    message: "Followed successfully",
    followSuccess,
  });
});

const findFollow = (followerId, followingId) =>
  prisma.follows.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });

const checkIsFollowing = asyncHandler(async (req, res) => {
  const followRecord = await findFollow(req.userId, req.valid.params.id);
  return res.status(200).json({ isFollowing: Boolean(followRecord) });
});

const totalFollowing = asyncHandler(async (req, res) => {
  const totalFollowings = await prisma.follows.findMany({
    where: { followerId: req.valid.params.id },
    include: { following: { select: publicUserSelect } },
  });

  return res.status(200).json({ totalFollowings });
});

const totalFollowers = asyncHandler(async (req, res) => {
  const totalFollowers = await prisma.follows.findMany({
    where: { followingId: req.valid.params.id },
    include: { follower: { select: publicUserSelect } },
  });

  return res.status(200).json({ totalFollowers });
});

const isFollowing = asyncHandler(async (req, res) => {
  const { followerId, followingId } = req.valid.query;
  const followRecord = await findFollow(followerId, followingId);
  return res.status(200).json({ isFollowing: Boolean(followRecord) });
});

module.exports = {
  totalFollowing,
  totalFollowers,
  followUnfollowUser,
  checkIsFollowing,
  isFollowing,
};
