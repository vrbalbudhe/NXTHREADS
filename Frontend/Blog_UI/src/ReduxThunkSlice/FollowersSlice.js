import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from 'axios'

const initialSlice = {
     followers: [],
     followings: [],
     loading: false,
     error: undefined
}

const Api = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const fetchAllFollowers = createAsyncThunk("follows/fetchAllFollowers",
     async (id, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/userfollow/followers/${id}`);
               console.log(res)
               return res.data.totalFollowers;
          } catch (error) {
               return thunkAPI.rejectWithValue(error.response?.data || error.message);
          }
     }
)

export const fetchAllFollowings = createAsyncThunk("follows/fetchAllFollowings",
     async (id, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/userfollow/following/${id}`);
               return res.data.totalFollowings;
          } catch (error) {
               return thunkAPI.rejectWithValue(error.response?.data || error.message);
          }
     }
)

export const followUnfollowUser = createAsyncThunk("follows/followUnfollowUser",
     async ({ followerId, followingId }, thunkAPI) => {
          try {
               const res = await axios.post(`${Api}/userfollow/follow`, {
                    followerId,
                    followingId
               });
               return res.data;
          } catch (error) {
               return thunkAPI.rejectWithValue(error.response?.data || error.message);
          }
     }
)

export const checkIsFollowing = createAsyncThunk("follows/checkIsFollowing",
     async ({ followerId, followingId }, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/userfollow/status?followerId=${followerId}&followingId=${followingId}`);
               return res.data.isFollowing;
          } catch (error) {
               return thunkAPI.rejectWithValue(error.response?.data || error.message);
          }
     }
)

const followSlice = createSlice({
     name: "follows",
     initialState: initialSlice,
     reducers: {
          // Add a new follower to the followers list
          addFollower: (state, action) => {
               const newFollower = action.payload;
               // Check if follower already exists by comparing the follower's user ID
               const existingFollower = state.followers.find(f => f.follower.id === newFollower.follower.id);
               if (!existingFollower) {
                    state.followers.push(newFollower);
               }
          },
          // Remove a follower from the followers list
          removeFollower: (state, action) => {
               const followerId = action.payload;
               state.followers = state.followers.filter(f => f.follower.id !== followerId);
          },
          // Add a new following to the followings list
          addFollowing: (state, action) => {
               const newFollowing = action.payload;
               // Check if following already exists by comparing the following's user ID
               const existingFollowing = state.followings.find(f => f.following.id === newFollowing.following.id);
               if (!existingFollowing) {
                    state.followings.push(newFollowing);
               }
          },
          // Remove a following from the followings list
          removeFollowing: (state, action) => {
               const followingId = action.payload;
               state.followings = state.followings.filter(f => f.following.id !== followingId);
          },
          // Clear followers and followings when switching users
          clearFollowData: (state) => {
               state.followers = [];
               state.followings = [];
               state.error = undefined;
          }
     },
     extraReducers: (builder) => {
          builder
               .addCase(fetchAllFollowers.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(fetchAllFollowers.fulfilled, (state, action) => {
                    state.loading = false;
                    state.followers = action.payload;
               })
               .addCase(fetchAllFollowers.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
               })
               .addCase(fetchAllFollowings.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(fetchAllFollowings.fulfilled, (state, action) => {
                    state.loading = false;
                    state.followings = action.payload;
               })
               .addCase(fetchAllFollowings.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
               })
               .addCase(followUnfollowUser.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(followUnfollowUser.fulfilled, (state, action) => {
                    state.loading = false;
                    // The action payload contains the result, but we need to update the lists
                    // based on the action that was performed (follow or unfollow)
                    // This will be handled by the component using the hook
               })
               .addCase(followUnfollowUser.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
               })
               .addCase(checkIsFollowing.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(checkIsFollowing.fulfilled, (state, action) => {
                    state.loading = false;
                    // Store the following status if needed
               })
               .addCase(checkIsFollowing.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
               });
     },
});

export const { addFollower, removeFollower, addFollowing, removeFollowing, clearFollowData } = followSlice.actions;
export default followSlice.reducer;