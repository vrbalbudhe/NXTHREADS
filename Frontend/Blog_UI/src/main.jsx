import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthContextProvider } from "./Context/AuthContext.jsx";
import { PostProvider } from "./Context/PostContext.jsx";
import { UserInfoProvider } from "./Context/UerInfoContext.jsx";
import { CommentProvider } from "./Context/CommentContext.jsx";
import { LikeContextProvider } from "./Context/LikeContext.jsx";
import store from "./store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthContextProvider>
        <UserInfoProvider>
          <PostProvider>
            <LikeContextProvider>
              <CommentProvider>
                <App />
              </CommentProvider>
            </LikeContextProvider>
          </PostProvider>
        </UserInfoProvider>
      </AuthContextProvider>
    </Provider>
  </React.StrictMode>
);
