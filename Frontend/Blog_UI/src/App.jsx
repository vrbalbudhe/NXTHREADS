import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Homepage from "./Routes/Homepage/Homepage.jsx";
import Login from "./Routes/Login/Login.jsx";
import Register from "./Routes/Register/Register.jsx";
import Profile from "./Routes/Profile/Profile.jsx";
import AboutPage from "./Routes/AboutPage/AboutPage.jsx";
import { singlePageLoader, usersInfoLoader } from "./Lib/Loaders.js";
import CreateBlog from "./Components/CreateBlog/CreateBlog.jsx";
import Search from "./Routes/Search/Search.jsx";
import ListPage from "./Routes/ListPage/ListPage.jsx";
import PrivacyPolicy from "./Routes/PrivacyPolicy/PrivacyPolicy.jsx";
import BloggersPage from "./Routes/BlogggersPage/BloggersPage.jsx";
import SinglePostPage from "./Routes/SinglePostPage/SinglePostPage.jsx";
import ChatingPage from "./Routes/ChatingPage/ChatingPage.jsx";
import { Layout, RequiredAuth } from "./Components/LayoutComponents/Layout.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/list", element: <ListPage />, loader: singlePageLoader },
      { path: "/register", element: <Register /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/policy", element: <PrivacyPolicy /> },
    ],
  },
  {
    path: "/",
    element: <RequiredAuth />,
    children: [
      { path: "/profile/:id", element: <Profile /> },
      { path: "/createBlog", element: <CreateBlog /> },
      { path: "/:id", element: <SinglePostPage /> },
      { path: "/chat", element: <ChatingPage /> },
      { path: "/bloggers", element: <BloggersPage />, loader: usersInfoLoader },
      { path: "/search", element: <Search /> },
    ],
  },
  { path: "/login", element: <Login /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
