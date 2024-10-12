// sockets/socket.js
const prisma = require('@prisma/client'); // Import Prisma if needed
let onlineUsers = {};

// Initialize the Socket.IO logic
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join event when a user connects
    socket.on('join', (userId) => {
      onlineUsers[userId] = socket.id;
      console.log(`User ${userId} is online with socket ID: ${socket.id}`);
    });

    // Handling message send
    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        // Find or create a chat between the sender and receiver
        let chat = await prisma.chat.findFirst({
          where: {
            participants: {
              hasEvery: [senderId, receiverId],
            },
          },
        });

        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              participants: [senderId, receiverId],
            },
          });
        }

        // Save the message in the database
        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content,
            chatId: chat.id,
          },
        });

        // Emit the message to the receiver if they are online
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', message);
        }

        // Optionally: emit the message back to the sender to update their chat UI
        socket.emit('messageSent', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handling user disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove the user from the online users list
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
    });
  });
};
