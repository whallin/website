/**
 * Manager interface for handling Cloudflare Turnstile CAPTCHA operations
 */
export interface TurnstileManager {
  /** Current Turnstile token, null if not available */
  token: string | null;
  /** Whether Turnstile has been rendered */
  rendered: boolean;
  /** Renders the Turnstile widget in the specified container */
  render: (
    containerId: string,
    siteKey: string,
    callbacks: TurnstileCallbacks,
  ) => void;
  /** Resets the Turnstile widget and clears the token */
  reset: () => void;
  /** Checks if a valid token is available */
  hasValidToken: () => boolean;
}

/**
 * Callback functions for Turnstile widget events
 */
export interface TurnstileCallbacks {
  /** Called when Turnstile challenge is successfully completed */
  onSuccess?: (token: string) => void;
  /** Called when an error occurs during Turnstile challenge */
  onError?: (errorCode: string) => void;
  /** Called when the Turnstile token expires */
  onExpired?: () => void;
}

/**
 * Creates a Turnstile manager for client-side usage
 * @returns TurnstileManager - Manager object with Turnstile utilities
 */
export function createTurnstileManager(): TurnstileManager {
  let token: string | null = null;
  let rendered = false;

  return {
    get token() {
      return token;
    },
    get rendered() {
      return rendered;
    },

    render(
      containerId: string,
      siteKey: string,
      callbacks: TurnstileCallbacks = {},
    ) {
      if (rendered) return;

      if (typeof window === "undefined" || !(window as any).turnstile) {
        console.error("Turnstile API not loaded");
        return;
      }

      const container = document.querySelector(containerId);
      if (container) {
        container.classList.remove("hidden");
      }

      (window as any).turnstile.render(containerId, {
        sitekey: siteKey,
        size: "flexible",
        callback: (newToken: string) => {
          token = newToken;
          callbacks.onSuccess?.(newToken);
        },
        "error-callback": (errorCode: string) => {
          token = null;
          callbacks.onError?.(errorCode);
        },
        "expired-callback": () => {
          token = null;
          callbacks.onExpired?.();
        },
      });

      rendered = true;
    },

    reset() {
      token = null;
      if (
        rendered &&
        typeof window !== "undefined" &&
        (window as any).turnstile
      ) {
        (window as any).turnstile.reset();
      }
    },

    hasValidToken() {
      return !!token;
    },
  };
}
