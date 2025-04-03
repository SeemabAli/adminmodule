/* eslint-disable @typescript-eslint/prefer-optional-chain */
import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { notify } from "@/lib/notify";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  className?: string;
  buttonText?: string;
  accept?: string;
  showPreview?: boolean;
  previewSize?: "small" | "medium" | "large";
  initialPreview?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  className = "",
  buttonText = "Upload Image",
  accept = "image/*",
  showPreview = true,
  previewSize = "medium",
  initialPreview = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(initialPreview);

  // Clean up object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);

      // Update preview
      setPreviewUrl(objectUrl);

      // Pass the file to parent component
      setIsLoading(true);
      onImageSelected(file);
      setIsLoading(false);
    } catch (error) {
      logger.error("Error processing file:", error);
      notify.error("Failed to process image");
    }
  };

  // Determine preview size class
  const previewSizeClass = {
    small: "w-16 h-16",
    medium: "w-32 h-32",
    large: "w-48 h-48",
  }[previewSize];

  const inputId = `image-upload-${buttonText.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-4">
        <label
          htmlFor={inputId}
          className="btn btn-primary cursor-pointer"
          role="button"
        >
          {isLoading ? "Processing..." : buttonText}
        </label>
        <input
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      {showPreview && previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Preview"
            className={`object-cover rounded-md ${previewSizeClass}`}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
