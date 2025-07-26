import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const Api = `${import.meta.env.VITE_API_BASE_URL}/api`;

const initialState = {
     posts: [],
     queryPosts: [],
     userPosts: [],
     loading: false,
     error: undefined,
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

const postSlice = createSlice({
     name: 'posts',
     initialState,
     reducers: {
          //x You can add local reducers if needed
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
               });
     },
});

export default postSlice.reducer;
