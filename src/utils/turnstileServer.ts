import { TURNSTILE_SECRET_KEY } from "astro:env/server";

/**
 * Response structure from Cloudflare's Turnstile siteverify API
 */
export interface TurnstileValidationResult {
  /** Whether the token validation was successful */
  success: boolean;
  /** Array of error codes if validation failed */
  "error-codes"?: string[];
  /** Timestamp of the challenge completion */
  challenge_ts?: string;
  /** Hostname where the challenge was solved */
  hostname?: string;
  /** Action name specified in the widget */
  action?: string;
  /** Custom data passed with the challenge */
  cdata?: string;
}

/**
 * Validates a Turnstile token using Cloudflare's Siteverify API
 * @param token - The Turnstile response token from the client
 * @param remoteIp - The client's IP address (optional but recommended)
 * @returns Promise<TurnstileValidationResult> - Validation result from Cloudflare
 */
export async function validateTurnstile(
  token: string,
  remoteIp?: string,
): Promise<TurnstileValidationResult> {
  if (!token) {
    return {
      success: false,
      "error-codes": ["missing-input-response"],
    };
  }

  const formData = new FormData();
  formData.append("secret", TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result: TurnstileValidationResult = await response.json();
    return result;
  } catch (error) {
    console.error("Turnstile validation error:", error);
    return {
      success: false,
      "error-codes": ["internal-error"],
    };
  }
}

/**
 * Gets the client IP address from the request headers
 * @param request - The request object or headers
 * @returns string - The client's IP address or 'unknown' if not found
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    request.headers.get("X-Real-IP") ||
    "unknown"
  );
}
