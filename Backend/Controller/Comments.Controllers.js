const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");

// Create Comment
const createComment = asyncHandler(async (req, res) => {
  const { commentor, postId, description } = req.body;

  if (!commentor || !postId || !description) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        postId,
        commentor,
        description,
      },
    });

    // Emit event to all connected clients
    const io = req.app.get("socketio");
    io.emit("commentCreated", newComment);
    console.log("comment emitted");

    return res.status(200).json({
      message: "Comment Created Successfully",
      success: true,
      newComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to create comment",
      success: false,
    });
  }
});

// Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const deletedComment = await prisma.comment.delete({
      where: {
        id: id,
      },
    });

    // Emit event to all connected clients
    const io = req.app.get("socketio");
    io.emit("commentDeleted", deletedComment);

    return res.status(200).json({
      message: "Comment Deleted Successfully",
      success: true,
      deletedComment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to delete comment",
      success: false,
    });
  }
});

// Get Comments
const getComments = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  try {
    const allComments = await prisma.comment.findMany({
      where: {
        postId,
      },
      include: {
        post: true,
        user: true,
      },
    });

    return res.status(200).json({
      message: "Successfully Comments Fetched",
      success: true,
      data: allComments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to fetch the comments",
      success: false,
    });
  }
});

module.exports = {
  createComment,
  deleteComment,
  getComments,
};
