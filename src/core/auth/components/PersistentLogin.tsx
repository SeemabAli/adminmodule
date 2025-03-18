import type { RootState } from "@/app/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { authActions } from "@/core/auth/auth.slice";
import { logger } from "@/lib/logger";
import { Outlet } from "react-router";
import { refreshAuthToken } from "@/common/services/token.service";
import { FullPageLoader } from "@/common/components/ui/FullPageLoader";

export const PersistentLogin = () => {
  const dispatch = useDispatch();
  const authToken = useSelector<RootState>((state) => state.auth.accessToken);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function refreshToken() {
      try {
        const { accessToken, roles } = await refreshAuthToken();
        dispatch(authActions.setAuth({ accessToken, roles }));
      } catch (error: unknown) {
        logger.error("Failed to refresh auth Token", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (!authToken) {
      void refreshToken();
    } else {
      setIsLoading(false);
    }
  }, [authToken, dispatch]);

  return isLoading ? <FullPageLoader /> : <Outlet />;
};
