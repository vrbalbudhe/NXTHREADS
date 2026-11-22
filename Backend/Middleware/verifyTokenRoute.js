const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const { readSession } = require("./verifyToken");

const unauthenticated = (res) =>
  res.status(401).json({ success: false, message: "User is not authenticated" });

const IsLoginCall = asyncHandler(async (req, res) => {
  const session = await readSession(req);
  if (!session?.userId) {
    return unauthenticated(res);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      fullname: true,
      email: true,
      avatar: true,
      gender: true,
      verified: true,
    },
  });
  if (!user || !user.verified) {
    return unauthenticated(res);
  }

  return res.status(200).json({
    success: true,
    message: "User is logged in",
    payload: {
      userId: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      avatar: user.avatar,
      gender: user.gender,
    },
  });
});

module.exports = IsLoginCall;
