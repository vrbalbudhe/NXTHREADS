let io = null;

const userRoom = (userId) => `user:${userId}`;

const setIo = (instance) => {
  io = instance;
};

const getIo = () => io;

const emitToUser = (userId, event, payload) => {
  if (io && userId) {
    io.to(userRoom(userId)).emit(event, payload);
  }
};

module.exports = { setIo, getIo, emitToUser, userRoom };
