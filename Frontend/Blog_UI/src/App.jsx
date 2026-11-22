import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "./Context/ThemeContext";
import AppShell, { GuestOnly, RequireAuth } from "./Components/layout/AppShell";
import { Spinner } from "./Components/ui/Feedback";
import Home from "./pages/Home";

const PostDetail = lazy(() => import("./pages/PostDetail"));
const WritePost = lazy(() =>
  import("./pages/PostEditor").then((module) => ({ default: module.WritePost }))
);
const EditPost = lazy(() =>
  import("./pages/PostEditor").then((module) => ({ default: module.EditPost }))
);
const Topics = lazy(() => import("./pages/Topics"));
const Explore = lazy(() => import("./pages/Explore"));
const People = lazy(() => import("./pages/People"));
const Profile = lazy(() => import("./pages/Profile"));
const Saved = lazy(() => import("./pages/Saved"));
const Settings = lazy(() => import("./pages/Settings"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const About = lazy(() =>
  import("./pages/StaticPages").then((module) => ({ default: module.About }))
);
const Privacy = lazy(() =>
  import("./pages/StaticPages").then((module) => ({ default: module.Privacy }))
);
const NotFound = lazy(() =>
  import("./pages/StaticPages").then((module) => ({ default: module.NotFound }))
);

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-6 w-6 text-brand-600" />
    </div>
  );
}

const page = (element) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;
const privatePage = (element) => <RequireAuth>{page(element)}</RequireAuth>;

function LegacyPostRedirect() {
  const { id } = useParams();
  return <Navigate to={`/post/${id}`} replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: "post/:id", element: page(<PostDetail />) },
      { path: "post/:id/edit", element: privatePage(<EditPost />) },
      { path: "write", element: privatePage(<WritePost />) },
      { path: "topics", element: page(<Topics />) },
      { path: "explore", element: page(<Explore />) },
      { path: "people", element: privatePage(<People />) },
      { path: "profile/:id", element: page(<Profile />) },
      { path: "saved", element: privatePage(<Saved />) },
      { path: "settings", element: privatePage(<Settings />) },
      { path: "messages", element: privatePage(<Messages />) },
      { path: "notifications", element: privatePage(<Notifications />) },
      { path: "about", element: page(<About />) },
      { path: "privacy", element: page(<Privacy />) },
      { path: "blog/:id", element: <LegacyPostRedirect /> },
      { path: "list", element: <Navigate to="/topics" replace /> },
      { path: "search", element: <Navigate to="/explore" replace /> },
      { path: "bloggers", element: <Navigate to="/people" replace /> },
      { path: "chat", element: <Navigate to="/messages" replace /> },
      { path: "createBlog", element: <Navigate to="/write" replace /> },
      { path: "policy", element: <Navigate to="/privacy" replace /> },
      { path: "*", element: page(<NotFound />) },
    ],
  },
  { path: "/login", element: <GuestOnly>{page(<Login />)}</GuestOnly> },
  { path: "/register", element: <GuestOnly>{page(<Register />)}</GuestOnly> },
]);

export default function App() {
  const { resolved } = useTheme();
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={2800}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme={resolved === "dark" ? "dark" : "light"}
      />
    </>
  );
}
