const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");

const followUnfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.body.followerId;
  const followingId = req.body.followingId;
  // console.log(followerId);
  // console.log(followingId);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: followerId,
      },
    });

    const userYouWillingToFollow = await prisma.user.findUnique({
      where: {
        id: followingId,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User Not Found",
        success: false,
      });
    }

    if (!userYouWillingToFollow) {
      return res.status(401).json({
        message: "User You Are Willing To Follow Is Not Found",
        success: false,
      });
    }

    // Check if the follow relationship already exists
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: followerId,
            followingId: followingId,
          },
        },
      });
      return res.status(200).json({
        message: "Unfollowed Successfully",
        success: true,
      });
    } else {
      // Follow
      const followSuccess = await prisma.follows.create({
        data: {
          followerId: followerId,
          followingId: followingId,
        },
      });
      return res.status(200).json({
        message: "Followed Successfully",
        success: true,
        followSuccess: followSuccess,
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Unable to follow or unfollow User",
      success: false,
    });
  }
});

const checkIsFollwing = asyncHandler(async (req, res) => {
  const followerId = req.params.id;
  try {
    console.log(followerId);
  } catch (error) {
    return res.status(500).json({
      message: "Error in CheckIsFollowing",
      success: false,
    });
  }
});

const totalFollowing = asyncHandler(async (req, res) => {
  const followerId = req.params.id;
  try {
    const totalFollowings = await prisma.follows.findMany({
      where: {
        followerId: followerId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            fullname: true,
            avatar: true,
          },
        },
      },
    });
    return res.status(200).json({
      totalFollowings: totalFollowings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in total following",
      success: false,
    });
  }
});
const totalFollowers = asyncHandler(async (req, res) => {
  const followerId = req.params.id;
  try {
    const totalFollowings = await prisma.follows.findMany({
      where: {
        followingId: followerId,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            fullname: true,
            avatar: true,
          },
        },
      },
    });
    return res.status(200).json({
      totalFollowers: totalFollowings,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Error in total followers",
      success: false,
    });
  }
});

const isFollowing = asyncHandler(async (req, res) => {
  const { followerId, followingId } = req.query;

  try {
    const followRecord = await prisma.follows.findFirst({
      where: {
        followerId: followerId,
        followingId: followingId,
      },
    });
    // io.emit("isFollowing", followRecord);

    const isFollowing = !!followRecord; // convert to boolean
    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error("Error checking follow status", error);
    res.status(500).json({ error: "Failed to check follow status" });
  }
});
module.exports = {
  totalFollowing,
  totalFollowers,
  followUnfollowUser,
  checkIsFollwing,
  // setIoInstance,
  isFollowing,
};
