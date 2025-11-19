import { useAuth, useUser } from "@clerk/clerk-react";

export function useClerkAuth() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  return {
    isAuthenticated: isSignedIn,
    user: user
      ? {
          id: user.id,
          username:
            user.username || user.primaryEmailAddress?.emailAddress || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        }
      : null,
    isLoading: !isLoaded,
    login: () => {
      // Clerk handles login through components
      window.location.href = "/sign-in";
    },
    logout: () => {
      // Clerk handles logout through components
      window.location.href = "/sign-out";
    },
  };
}
