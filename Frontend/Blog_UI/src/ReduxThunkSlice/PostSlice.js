import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const Api = `${import.meta.env.VITE_API_BASE_URL}/api`;

const initialState = {
     posts: [],
     queryPosts: [],
     userPosts: [],
     likedPosts: {},
     reactions: {},
     savedState: {},
     deletedPosts: {},
     loading: false,
     error: undefined,
     comments: {},
     commentLoading: false,
     commentError: undefined,
     personalizedPosts: []
};

const PAGE_SIZE = 10;

export const fetchAllPosts = createAsyncThunk(
     "posts/fetchAllPosts",
     async ({ page = 1 } = {}, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/post`, {
                    params: { page, limit: PAGE_SIZE },
                    withCredentials: true,
               });
               return { posts: res?.data?.posts || [], meta: res?.data?.meta, page };
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
               const res = await axios.get(`${Api}/post/fltr?${query}`, { withCredentials: true });
               return res.data.posts;
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const fetchPostsByUserId = createAsyncThunk("posts/fetchPostsByUserId",
     async (id, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/post/${id}`, { withCredentials: true });
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
               await axios.delete(`${Api}/post/${postId}`, { withCredentials: true });
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
               const res = await axios.post(`${Api}/post/like`, { postId, userId }, { withCredentials: true });
               return res.data;
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const unlikePostThunk = createAsyncThunk(
     'posts/unlikePost',
     async ({ postId, userId }, thunkAPI) => {
          try {
               const res = await axios.post(`${Api}/post/unlike`, { postId, userId }, { withCredentials: true });
               return res.data;
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const fetchPostLikeStatus = createAsyncThunk(
     'posts/fetchLikeStatus',
     async ({ postId, userId }, thunkAPI) => {
          try {
               const res = await axios.post(`${Api}/post/likecheck`, { postId, userId }, { withCredentials: true });
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
               const res = await axios.get(`${Api}/comment/${postId},`, { withCredentials: true });
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
               }, { withCredentials: true });
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
               await axios.delete(`${Api}/comment/delete/${commentId}`, { withCredentials: true });
               return { commentId, postId };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const toggleSavePostThunk = createAsyncThunk(
     "posts/toggleSavePost",
     async ({ postId, saved }, thunkAPI) => {
          try {
               await axios.post(`${Api}/post/fav`, { postId }, { withCredentials: true });
               return { postId, saved };
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const fetchSavedPosts = createAsyncThunk(
     "posts/fetchSavedPosts",
     async (userId, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/post/fav/${userId}`, { withCredentials: true });
               return res.data?.posts || [];
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
);

export const personalizedPostsThunk = createAsyncThunk(
     "posts/personalizedPosts",
     async ({ userId, page = 1 }, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/post/gfp/${userId}`, {
                    params: { page, limit: PAGE_SIZE },
                    withCredentials: true,
               });
               return { posts: res?.data?.posts || [], meta: res?.data?.meta, page };
          } catch (error) {
               return thunkAPI.rejectWithValue(error.response?.data || error.message);
          }
     }
)
const applyReaction = (state, action) => {
     const { postId, likes, unlikes, isLiked, isUnliked } = action.payload || {};
     if (!postId) {
          return;
     }
     state.likedPosts[postId] = { isLiked, isUnliked };
     state.reactions[postId] = { likes, unlikes };
};

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
                    const { posts, page } = action.payload;
                    state.loading = false;
                    state.posts = page > 1 ? [...state.posts, ...posts] : posts;
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
               .addCase(likePostThunk.fulfilled, applyReaction)
               .addCase(unlikePostThunk.fulfilled, applyReaction)
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
                    state.deletedPosts[postId] = true;
                    state.posts = state.posts?.filter(
                         (post) => post.id !== postId
                    );
               })
               .addCase(toggleSavePostThunk.fulfilled, (state, action) => {
                    const { postId, saved } = action.payload;
                    state.savedState[postId] = saved;
               })
               .addCase(personalizedPostsThunk.fulfilled, (state, action) => {
                    const { posts, page } = action.payload;
                    state.personalizedPosts =
                         page > 1 ? [...state.personalizedPosts, ...posts] : posts;
               })
     },
});

export default postSlice.reducer;
