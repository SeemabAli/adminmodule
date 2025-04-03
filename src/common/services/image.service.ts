import { logger } from "@/lib/logger";
import { notify } from "@/lib/notify";
import axios from "axios";
import { store } from "@/app/store/store";
import { config } from "@/config/config";

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
 * @returns The uploaded image data including the path
 */
export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  try {
    // Validate that we have a valid File object
    if (!file || !(file instanceof File) || file.size === 0) {
      const errorMsg = "Invalid file provided for upload";
      logger.error(errorMsg, { fileType: typeof file, fileSize: file?.size });
      throw new Error(errorMsg);
    }

    logger.info(
      `Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`,
    );

    // Create FormData and append file with filename
    const formData = new FormData();
    formData.append("file", file, file.name);

    // Debug information about the formData
    const fileFromFormData = formData.get("file");
    logger.info("FormData check:", {
      hasFile: !!fileFromFormData,
      fileType:
        fileFromFormData instanceof File ? "File" : typeof fileFromFormData,
      fileSize:
        fileFromFormData instanceof File ? fileFromFormData.size : "unknown",
    });

    // Get auth token from Redux store
    const accessToken = store.getState().auth.accessToken;

    // Direct axios call with proper headers for multipart/form-data
    const response = await axios.post<ImageUploadResponse>(
      `${config.api.baseUrl}/upload/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      },
    );

    if (!response.data) {
      throw new Error("No data received from upload");
    }

    logger.info("Upload successful:", response.data);
    return response.data;
  } catch (error) {
    logger.error("Failed to upload image:", error);
    notify.error("Image upload failed. Please try again.");
    throw error;
  }
};

// export const uploadPDF = async (file: File): Promise<ImageUploadResponse> => {
//   try {
//     const formData = new FormData();
//     formData.append("file", file, file.name);
//   }
// } catch (error) {
//   logger.error("Failed to upload PDF:", error);
//   notify.error("PDF upload failed. Please try again.");
//   throw error;
// }
// };
