import type { RegisterUserData, SignInUserData } from "../schema/auth.schema";
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
