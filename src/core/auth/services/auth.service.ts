import type {
  setPasswordData,
  RegisterUserData,
  SignInUserData,
} from "../schema/auth.schema";
import { sendApiRequest } from "@/common/services/api.service";

type SignInResponse = {
  accessToken: string;
  roles: number[];
  requiresPasswordChange: boolean;
};

export type UserProfile = Omit<RegisterUserData, "password">;

export type GetUserProfileResponse = {
  user: UserProfile;
};

export async function signInUser(userData: SignInUserData) {
  const response = await sendApiRequest<SignInResponse>("/auth/login", {
    method: "POST",
    withCredentials: true,
    data: userData,
  });
  return response;
}

export async function requestPasswordReset(email: string) {
  const response = await sendApiRequest("/auth/request-password-reset", {
    method: "POST",
    data: { email },
  });
  return response;
}

/**
 * Changes user password from temporary credentials to permanent password
 * @param data The password change form data
 */
export async function setPassword(data: setPasswordData) {
  const response = await sendApiRequest<{ message: string }>(
    "/auth/set-password",
    {
      method: "POST",
      data,
    },
  );
  return response;
}
