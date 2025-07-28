import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Homepage from "./Routes/Homepage.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Routes/Login.jsx";
import Register from "./Routes/Register.jsx";
import Profile from "./Routes/Profile.jsx";
import AboutPage from "./Routes/AboutPage.jsx";
import CreateBlog from "./Components/CreateBlog/CreateBlog.jsx";
import Search from "./Routes/Search.jsx";
import ListPage from "./Routes/ListPage.jsx";
import PrivacyPolicy from "./Routes/PrivacyPolicy.jsx";
import BloggersPage from "./Routes/BloggersPage.jsx";
import SinglePostPage from "./Routes/SinglePostPage.jsx";
import ChatingPage from "./Routes/ChatingPage.jsx";
import { Layout, RequiredAuth } from "./Components/LayoutComponents/Layout.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/list", element: <ListPage /> },
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
      { path: "/bloggers", element: <BloggersPage /> },
      { path: "/search", element: <Search /> },
    ],
  },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

export default App;
