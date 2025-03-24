import type { FormError } from "@/common/services/api.service";

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
