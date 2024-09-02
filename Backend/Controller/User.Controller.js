const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");

const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  // console.log(userId);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        password: false,
        savedPosts: true,
        followers: true,
        following: true,
      },
    });
    if (!user) {
      return res.status(401).json({
        message: "No User Found",
        success: false,
      });
    }
    return res.status(200).json({
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to GetUser",
      success: false,
    });
  }
});
const getUserFollowStatus = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        password: false,
        followers: true,
      },
    });
    if (!user) {
      return res.status(401).json({
        message: "No User Found",
        success: false,
      });
    }
    return res.status(200).json({
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to GetUser",
      success: false,
    });
  }
});
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        avatar: true,
        id: true,
        username: true,
        fullname: true,
      },
    });

    return res.status(200).json({
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to GetUsers",
      success: false,
    });
  }
});
const deleteUser = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to Delete_User",
      success: false,
    });
  }
});
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullname, gender, avatar } = req.body;

  try {
    // console.log("fullname: ", fullname);
    // console.log("id: ", id);
    // console.log("gender: ", gender);
    // console.log("avatar: ", avatar);

    let imageUrls = avatar || [];

    const findUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!findUser) {
      return res.status(401).json({
        message: "Unable to find the user",
        success: false,
      });
    }

    const updateUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        fullname: fullname,
        gender: gender,
        avatar: imageUrls,
      },
    });

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Update_User",
      success: false,
      error: error.message,
    });
  }
});

module.exports = {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserFollowStatus,
};
