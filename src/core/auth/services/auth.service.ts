/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ChangePasswordData,
  RegisterUserData,
  SignInUserData,
} from "../schema/auth.schema";
import { sendApiRequest } from "@/common/services/api.service";

type SignInResponse = {
  accessToken: string;
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
export async function changePassword(data: ChangePasswordData) {
  const response = await sendApiRequest<{ message: string }>(
    "/auth/change-password",
    {
      method: "POST",
      data,
    },
  );
  return response;
}

/**
 * Check if the user needs to change their temporary password
 */
export async function checkPasswordChangeRequired() {
  const response = await sendApiRequest<{
    data: any;
    changeRequired: boolean;
  }>("/auth/password-status", {
    method: "GET",
  });
  return response.data.changeRequired;
}
