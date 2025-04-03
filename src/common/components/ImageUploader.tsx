/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import React, { useState, useEffect, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Update preview if initialPreview changes
  useEffect(() => {
    if (initialPreview) {
      setPreviewUrl(initialPreview);
    }
  }, [initialPreview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      logger.warn("No files selected");
      return;
    }

    const file = files[0];
    if (!file) {
      logger.warn("File is null or undefined");
      return;
    }

    // Validate file
    if (!(file instanceof File)) {
      logger.error("Selected item is not a File object");
      notify.error("Invalid file selected");
      return;
    }

    if (file.size === 0) {
      logger.error("File size is 0 bytes");
      notify.error("Selected file is empty");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit example
      logger.error("File too large");
      notify.error("Selected file is too large (max 10MB)");
      return;
    }

    logger.info(
      `File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`,
    );

    try {
      // Clean up previous preview if exists
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Pass the file to parent component
      setIsLoading(true);

      try {
        // Direct file handoff, no base64 conversion
        await onImageSelected(file);
      } catch (error) {
        logger.error("Error in parent handler:", error);
        notify.error("Failed to process image");
      } finally {
        setIsLoading(false);
      }

      // Reset the input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      logger.error("Error processing file:", error);
      notify.error("Failed to process image");
      setIsLoading(false);
    }
  };

  // Determine preview size class
  const previewSizeClass = {
    small: "w-16 h-16",
    medium: "w-32 h-32",
    large: "w-48 h-48",
  }[previewSize];

  // Create a truly unique ID for the input
  const uniqueId = React.useMemo(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `image-upload-${timestamp}-${random}`;
  }, []);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-4">
        <label
          htmlFor={uniqueId}
          className="btn btn-primary cursor-pointer"
          role="button"
          aria-busy={isLoading}
        >
          {isLoading ? "Processing..." : buttonText}
        </label>
        <input
          id={uniqueId}
          ref={fileInputRef}
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
            onError={() => {
              logger.error("Image preview failed to load");
              setPreviewUrl("");
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
