import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const Api = `${import.meta.env.VITE_API_BASE_URL}/api`;

const initialState = {
     posts: [],
     queryPosts: [],
     userPosts: [],
     likedPosts: {},
     loading: false,
     error: undefined,
     comments: {},
     commentLoading: false,
     commentError: undefined,
};

export const fetchAllPosts = createAsyncThunk(
     "posts/fetchAllPosts",
     async (_, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/post`);
               return res?.data?.posts;
          } catch (error) {
               const message =
                    error.response?.data?.message || error.message || "Something went wrong";
               return thunkAPI.rejectWithValue(message);
          }
     }
);

export const fetchQueryPosts = createAsyncThunk(
     "posts/fetchQueryPosts",
     async (queryParams, thunkAPI) => {
          try {
               const query = new URLSearchParams(queryParams).toString();
               const res = await axios.get(`${Api}/post/fltr?${query}`);
               return res.data.posts;
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const fetchPostsByUserId = createAsyncThunk("posts/fetchPostsByUserId",
     async (id, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/post/${id}`);
               return res.data.posts;
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
)

export const deletePost = createAsyncThunk(
     "posts/deletePost",
     async ({ postId }, thunkAPI) => {
          try {
               await axios.delete(`${Api}/post/${postId}`);
               return { postId };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const likePostThunk = createAsyncThunk(
     'posts/likePost',
     async ({ postId, userId }, thunkAPI) => {
          try {
               const res = await axios.post(`${Api}/post/like`, { postId, userId });
               console.log(res);
               return { postId };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const unlikePostThunk = createAsyncThunk(
     'posts/unlikePost',
     async ({ postId, userId }, thunkAPI) => {
          try {
               const res = await axios.post(`${Api}/post/unlike`, { postId, userId });
               return { postId };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const fetchPostLikeStatus = createAsyncThunk(
     'posts/fetchLikeStatus',
     async ({ postId, userId }, thunkAPI) => {
          try {
               const res = await axios.post(`${Api}/post/likecheck`, { postId, userId });
               return { postId, isLiked: res.data.isLiked, isUnliked: res.data.isUnliked };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const fetchCommentsByPostId = createAsyncThunk(
     "posts/fetchCommentsByPostId",
     async (postId, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/comment/${postId}`);
               return { postId, comments: res.data.data };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const createCommentThunk = createAsyncThunk(
     "posts/createComment",
     async ({ postId, commentor, description }, thunkAPI) => {
          try {
               const res = await axios.post(`${Api}/comment/create`, {
                    postId,
                    commentor,
                    description,
               });
               return { postId, comment: res.data.newComment };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const deleteCommentThunk = createAsyncThunk(
     "posts/deleteComment",
     async ({ commentId, postId }, thunkAPI) => {
          try {
               await axios.delete(`${Api}/comment/delete/${commentId}`);
               return { commentId, postId };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

const postSlice = createSlice({
     name: 'posts',
     initialState,
     reducers: {
     },
     extraReducers: (builder) => {
          builder
               .addCase(fetchAllPosts.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(fetchAllPosts.fulfilled, (state, action) => {
                    state.loading = false;
                    state.posts = action.payload;
               })
               .addCase(fetchAllPosts.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
               })
               .addCase(fetchQueryPosts.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(fetchQueryPosts.fulfilled, (state, action) => {
                    state.loading = false;
                    state.queryPosts = action.payload;
               })
               .addCase(fetchQueryPosts.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
               })
               .addCase(fetchPostsByUserId.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(fetchPostsByUserId.fulfilled, (state, action) => {
                    state.loading = false;
                    state.userPosts = action.payload;
               })
               .addCase(fetchPostsByUserId.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
               })
               .addCase(fetchPostLikeStatus.fulfilled, (state, action) => {
                    const { postId, isLiked, isUnliked } = action.payload;
                    state.likedPosts[postId] = { isLiked, isUnliked };
               })
               .addCase(likePostThunk.fulfilled, (state, action) => {
                    const { postId } = action.payload;
                    const post = state.posts.find((p) => p.id === postId);
                    const currentStatus = state.likedPosts[postId] || { isLiked: false, isUnliked: false };

                    if (post) {
                         if (currentStatus.isLiked) {
                              // Undo Like
                              if (post.likes > 0) post.likes -= 1;
                              state.likedPosts[postId] = { isLiked: false, isUnliked: false };
                         } else {
                              // Like
                              post.likes += 1;
                              if (currentStatus.isUnliked && post.unlikes > 0) post.unlikes -= 1;
                              state.likedPosts[postId] = { isLiked: true, isUnliked: false };
                         }
                    }
               })
               .addCase(unlikePostThunk.fulfilled, (state, action) => {
                    const { postId } = action.payload;
                    const post = state.posts.find((p) => p.id === postId);
                    const currentStatus = state.likedPosts[postId] || { isLiked: false, isUnliked: false };

                    if (post) {
                         if (currentStatus.isUnliked) {
                              // Undo Unlike
                              if (post.unlikes > 0) post.unlikes -= 1;
                              state.likedPosts[postId] = { isLiked: false, isUnliked: false };
                         } else {
                              // Unlike
                              post.unlikes += 1;
                              if (currentStatus.isLiked && post.likes > 0) post.likes -= 1;
                              state.likedPosts[postId] = { isLiked: false, isUnliked: true };
                         }
                    }
               })
               .addCase(fetchCommentsByPostId.pending, (state) => {
                    state.commentLoading = true;
                    state.commentError = undefined;
               })
               .addCase(fetchCommentsByPostId.fulfilled, (state, action) => {
                    state.commentLoading = false;
                    const { postId, comments } = action.payload;
                    state.comments[postId] = comments;
               })
               .addCase(fetchCommentsByPostId.rejected, (state, action) => {
                    state.commentLoading = false;
                    state.commentError = action.payload;
               })

               .addCase(createCommentThunk.fulfilled, (state, action) => {
                    const { postId, comment } = action.payload;
                    if (!state.comments[postId]) state.comments[postId] = [];
                    state.comments[postId].push(comment);
               })

               .addCase(deleteCommentThunk.fulfilled, (state, action) => {
                    const { commentId, postId } = action.payload;
                    state.comments[postId] = state.comments[postId]?.filter(
                         (c) => c.id !== commentId
                    );
               })
               .addCase(deletePost.fulfilled, (state, action) => {
                    const { postId } = action.payload;
                    state.posts = state.posts?.filter(
                         (post) => post.id !== postId
                    );
               })
     },
});

export default postSlice.reducer;
