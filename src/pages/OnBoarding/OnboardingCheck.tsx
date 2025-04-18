/* eslint-disable @typescript-eslint/require-await */
import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { ROLES } from "@/common/constants/roles.constants";
import { notify } from "@/lib/notify";
import type { RootState } from "@/app/store/store";

// Mock API call - replace with your actual API call to check if onboarding is complete
const checkOnboardingStatus = async (userId: string) => {
  // This would be an API call to check if the user has completed onboarding
  // For now, we'll check localStorage as a mock implementation
  const onboardingCompleted = localStorage.getItem(
    `onboarding_completed_${userId}`,
  );
  return onboardingCompleted === "true";
};

const OnboardingCheck = () => {
  // Access auth state from Redux store directly instead of using useAuth hook
  // Adjust the path to your store file
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      // Only check for OWNER role
      if (auth?.roles?.includes(ROLES.OWNER)) {
        try {
          const isOnboardingComplete = await checkOnboardingStatus(auth.userId);

          if (!isOnboardingComplete && location.pathname !== "/onboarding") {
            // Save the location they were trying to access
            notify.error("Please complete onboarding first");
            void navigate("/onboarding", {
              state: { from: location },
              replace: true,
            });
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          notify.error("Failed to check onboarding status");
        }
      }

      setIsLoading(false);
    };

    // Check if auth is initialized before proceeding
    if (auth) {
      void checkStatus();
    } else {
      setIsLoading(false);
    }
  }, [auth, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return <Outlet />;
};

export default OnboardingCheck;
