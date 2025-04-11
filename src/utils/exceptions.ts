import type { FormError } from "@/common/services/api.service";
import { notify } from "@/lib/notify";

export class ApiException extends Error {
  public constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    private readonly errors?: FormError,
  ) {
    super(message);
  }
}

const NOTIFYERRORMESSAGE = {
  400: "Invalid request data. Please check your input and try again.",
  401: "Your session has expired. Please sign in again to continue.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found. Please verify and try again.",
  409: "This operation couldn't be completed due to a conflict with existing data.",
  422: "The provided data is invalid. Please check your input and try again.",
  500: "Something went wrong on our servers. Please try again later.",
  501: "This feature is not yet available.",
  502: "Unable to reach the server. Please check your connection and try again.",
};

export const handleErrorNotification = (error: unknown, resource: string) => {
  if (error instanceof ApiException) {
    const baseMessage =
      NOTIFYERRORMESSAGE[error.statusCode as keyof typeof NOTIFYERRORMESSAGE] ||
      error.message;
    const resourceContext = resource ? ` while managing ${resource}` : "";

    // Handle specific error codes with resource context
    switch (error.statusCode) {
      case 404:
        notify.error(`${resource} not found. Please verify and try again.`);
        break;
      case 409:
        notify.error(`${resource} already exists with these details.`);
        break;
      case 403:
        notify.error(`You don't have permission to manage this ${resource}.`);
        break;
      default:
        notify.error(`${baseMessage}${resourceContext}`);
    }
    return;
  }

  if (error instanceof Error) {
    const resourceContext = resource ? ` while managing ${resource}` : "";
    notify.error(`${error.message}${resourceContext}`);
    return;
  }

  notify.error(
    `An unexpected error occurred${resource ? ` while managing ${resource}` : ""}`,
  );
};
