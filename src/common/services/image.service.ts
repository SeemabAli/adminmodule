import { sendApiRequest } from "./api.service";
import { logger } from "@/lib/logger";

export interface ImageUploadResponse {
  path: string;
  url: string;
  size: number;
  fileName: string;
  mimeType: string;
}

/**
 * Uploads an image file to the server
 * @param file The image file to upload
 * @param folder Optional folder path where image should be stored
 * @returns The uploaded image data including the path
 */
export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await sendApiRequest<ImageUploadResponse>(
      "/upload/image",
      {
        method: "POST",
        withAuthorization: true,
        data: formData,
      },
    );

    return response;
  } catch (error) {
    logger.error("Failed to upload image:", error);
    throw error;
  }
};
