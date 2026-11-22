const publicUserSelect = {
  id: true,
  username: true,
  fullname: true,
  avatar: true,
};

const postIncludeFor = (viewerId) => ({
  User: { select: publicUserSelect },
  _count: { select: { comment: true } },
  ...(viewerId && {
    savedPosts: { where: { userId: viewerId }, select: { id: true } },
    like: { where: { userId: viewerId }, select: { id: true } },
    unlike: { where: { userId: viewerId }, select: { id: true } },
  }),
});

const shapePost = (post) => {
  if (!post) {
    return post;
  }
  const { savedPosts, like, unlike, _count, ...rest } = post;
  return {
    ...rest,
    likes: Math.max(rest.likes ?? 0, 0),
    unlikes: Math.max(rest.unlikes ?? 0, 0),
    commentCount: _count?.comment ?? 0,
    viewer: {
      saved: Boolean(savedPosts?.length),
      liked: Boolean(like?.length),
      disliked: Boolean(unlike?.length),
    },
  };
};

module.exports = { publicUserSelect, postIncludeFor, shapePost };
