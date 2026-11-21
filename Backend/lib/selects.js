const publicUserSelect = {
  id: true,
  username: true,
  fullname: true,
  avatar: true,
};

const postInclude = {
  savedPosts: true,
  User: { select: publicUserSelect },
  comment: {
    include: {
      user: { select: publicUserSelect },
    },
  },
};

module.exports = { publicUserSelect, postInclude };
