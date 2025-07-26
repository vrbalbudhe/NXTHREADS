import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const Api = `${import.meta.env.VITE_API_BASE_URL}/api`;

const initialState = {
     users: [],
     currentUser: [],
     loading: false,
     error: undefined,
};

export const fetchAllUsers = createAsyncThunk(
     "users/fetchAllUsers",
     async (_, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/user`);
               return res?.data?.users;
          } catch (error) {
               const message =
                    error.response?.data?.message || error.message || "Something went wrong";
               return thunkAPI.rejectWithValue(message);
          }
     }
);


export const fetchUserById = createAsyncThunk("posts/fetchUserById",
     async (id, thunkAPI) => {
          try {
               const res = await axios.get(`${Api}/user/${id}`);
               return res.data.user;
          } catch (err) {
               return thunkAPI.rejectWithValue(err.response?.data || err.message);
          }
     }
)


const userSlice = createSlice({
     name: 'users',
     initialState,
     reducers: {
          //x You can add local reducers if needed
     },
     extraReducers: (builder) => {
          builder
               .addCase(fetchAllUsers.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(fetchAllUsers.fulfilled, (state, action) => {
                    state.loading = false;
                    state.users = action.payload;
               })
               .addCase(fetchAllUsers.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
               })
               .addCase(fetchUserById.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
               })
               .addCase(fetchUserById.fulfilled, (state, action) => {
                    state.loading = false;
                    state.users = action.payload;
               })
               .addCase(fetchUserById.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
               });
     },
});

export default userSlice.reducer;
