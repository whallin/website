/**
 * Extracts user-friendly error messages from Astro action errors
 * Handles both stringified validation errors and direct error messages
 */
export function extractErrorMessage(error: any): string {
  if (!error?.message) return "An error occurred";

  if (typeof error.message === "string") {
    const validationPrefix = "Failed to validate: ";
    if (error.message.startsWith(validationPrefix)) {
      try {
        const jsonString = error.message.substring(validationPrefix.length);
        const validationErrors = JSON.parse(jsonString);
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          const firstError = validationErrors[0] as { message?: string };
          return firstError.message || "Validation failed";
        }
      } catch {
        return error.message;
      }
    }
    return error.message;
  }

  return "An error occurred";
}
