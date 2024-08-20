const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");

let io;

const setIoInstance = (socketIo) => {
  io = socketIo;
  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

const totalFollowingIo = asyncHandler(async (req, res) => {
  const followerId = req.params.id;
  try {
    const totalFollowings = await prisma.follows.findMany({
      where: {
        followerId: followerId,
      },
    });
    if (io) {
      io.emit("v", totalFollowings);
    }

    return res.status(200).json({
      totalFollowings: totalFollowings,
    });
  } catch (error) {
    console.error("Error in total following:", error);
    return res.status(500).json({
      message: "Error in total following",
      success: false,
    });
  }
});

module.exports = {
  totalFollowingIo,
  setIoInstance,
};
