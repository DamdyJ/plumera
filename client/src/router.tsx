import { createBrowserRouter } from "react-router";
import App from "./App";
import NotFoundPage from "./pages/NotFoundPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ChatPage from "./pages/chat/ChatPage";
import ErrorPage from "./pages/ErrorPage";
import ChatSlugPage from "./pages/chat/ChatSlugPage";
import ChatLayout from "./pages/chat/components/ChatLayout";
import { Protect, RedirectToSignIn } from "@clerk/clerk-react";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/sign-up",
    element: <SignUpPage />,
  },

  {
    path: "/chat",
    element: (
      <Protect fallback={<RedirectToSignIn />}>
        <ChatLayout />
      </Protect>
    ),
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
      {
        path: ":id",
        element: <ChatSlugPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
