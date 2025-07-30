const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");

const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
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
  const {
    password,
    fullname,
    gender,
    avatar,
    verified,
  } = req.body;
  try {
    const findUser = await prisma.user.findUnique({ where: { id } });

    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    let updatedFields = {
      ...(fullname !== undefined && { fullname }),
      ...(gender !== undefined && { gender }),
      ...(avatar !== undefined && { avatar }),
      ...(typeof verified === "boolean" && { verified }),
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedFields,
    });

    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update user",
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
