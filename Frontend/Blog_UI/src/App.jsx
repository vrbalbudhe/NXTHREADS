import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Homepage from "../../Blog_UI/src/Routes/Homepage/Homepage.jsx";
import { RequiredAuth, Layout } from "/src/Routes/Layout/Layout.jsx";
import Login from "./Routes/Login/Login.jsx";
import Register from "./Routes/Register/Register.jsx";
import Profile from "./Routes/Profile/Profile.jsx";
import AboutPage from "./Routes/AboutPage/AboutPage.jsx";
import {
  combinedLoader,
  fetchAllPosts,
  singlePageLoader,
  usersInfoLoader,
} from "./Lib/Loaders.js";
import CreateBlog from "./Components/CreateBlog/CreateBlog.jsx";
import Search from "./Routes/Search/Search.jsx";
import ListPage from "./Routes/ListPage/ListPage.jsx";
import PrivacyPolicy from "./Routes/PrivacyPolicy/PrivacyPolicy.jsx";
import BloggersPage from "./Routes/BlogggersPage/BloggersPage.jsx";
import SinglePostPage from "./Routes/SinglePostPage/SinglePostPage.jsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      // loader: combinedLoader,
      children: [
        {
          path: "/",
          element: <Homepage />,
          loader: fetchAllPosts,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: singlePageLoader,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/about",
          element: <AboutPage />,
        },
        {
          path: "/search",
          element: <Search />,
          loader: singlePageLoader,
        },
        {
          path: "/policy",
          element: <PrivacyPolicy />,
        },
      ],
    },
    {
      path: "/",
      element: <RequiredAuth />,
      children: [
        {
          path: "/profile/:id",
          element: <Profile />,
          loader: combinedLoader,
        },
        {
          path: "/createBlog",
          element: <CreateBlog />,
        },
        {
          path: "/:id",
          element: <SinglePostPage />,
        },
        {
          path: "/bloggers",
          element: <BloggersPage />,
          loader: usersInfoLoader,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
