import { configureStore } from '@reduxjs/toolkit';
import postReducer from './ReduxThunkSlice/PostSlice';
import userReducer from './ReduxThunkSlice/UserSlice';
import followReducer from './ReduxThunkSlice/FollowersSlice';

const store = configureStore({
     reducer: {
          post: postReducer,
          user: userReducer,
          follows: followReducer,
     },
});

export default store;
