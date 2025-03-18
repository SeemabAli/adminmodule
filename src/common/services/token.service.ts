import { axiosPublic } from "@/api/axios";

type RefreshTokenResponse = {
  accessToken: string;
  roles: number[];
};

export async function refreshAuthToken() {
  const response = await axiosPublic<RefreshTokenResponse>({
    method: "POST",
    url: "/auth/refresh-token",
    withCredentials: true,
  });
  return response.data;
}
