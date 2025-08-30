import { actions } from "astro:actions";
import { TURNSTILE_SITE_KEY } from "astro:env/client";
import { createTurnstileManager } from "../../utils/turnstile";
import { extractErrorMessage } from "../../utils/actionErrorHandler";

const form = document.getElementById("newsletter-form") as HTMLFormElement;
const submitBtn = document.getElementById(
  "newsletter-submit-btn",
) as HTMLButtonElement;
const successMessage = document.getElementById(
  "newsletter-success-message",
) as HTMLElement;
const errorMessage = document.getElementById(
  "newsletter-error-message",
) as HTMLElement;
const errorText = document.getElementById(
  "newsletter-error-text",
) as HTMLElement;
const turnstileManager = createTurnstileManager();

/**
 * Manages UI state for messages and button
 */
const uiManager = {
  toggleElement: (element: HTMLElement, show: boolean) => {
    element.classList.toggle("hidden", !show);
    element.classList.toggle("flex", show);
  },

  showMessage: (type: "success" | "error", message?: string) => {
    const isSuccess = type === "success";
    uiManager.toggleElement(successMessage, isSuccess);
    uiManager.toggleElement(errorMessage, !isSuccess);

    if (!isSuccess && message) {
      errorText.textContent = message;
    }
  },

  hideMessages: () => {
    uiManager.toggleElement(successMessage, false);
    uiManager.toggleElement(errorMessage, false);
  },

  setButtonState: (
    disabled: boolean,
    opacity: string = "",
    title: string = "",
  ) => {
    submitBtn.disabled = disabled;
    submitBtn.style.opacity = opacity;
    submitBtn.title = title;
  },

  updateSubmitButton: () => {
    const hasToken = turnstileManager.hasValidToken();
    uiManager.setButtonState(
      !hasToken,
      hasToken ? "" : "0.5",
      hasToken ? "" : "Complete the captcha first",
    );
  },
};

/**
 * Handles form submission with validation and error handling
 */
const handleSubmit = async (event: Event) => {
  event.preventDefault();

  if (!turnstileManager.hasValidToken()) {
    uiManager.showMessage("error", "Complete the captcha before submitting.");
    return;
  }

  uiManager.hideMessages();
  uiManager.setButtonState(true, "0.5");

  try {
    const formData = new FormData(form);
    formData.set("cf-turnstile-response", turnstileManager.token!);

    const { error } = await actions.subscribeToNewsletter(formData);
    if (error) {
      throw new Error(extractErrorMessage(error));
    }

    uiManager.showMessage("success");
    form.reset();
    turnstileManager.reset();
    uiManager.updateSubmitButton();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    uiManager.showMessage("error", message);
    turnstileManager.reset();
    uiManager.updateSubmitButton();
  } finally {
    uiManager.setButtonState(false);
  }
};

/**
 * Initializes Turnstile widget with event handlers
 */
const initializeTurnstile = () => {
  const onFirstInput = () => {
    uiManager.hideMessages();

    if (!turnstileManager.rendered) {
      turnstileManager.render(
        "#newsletter-turnstile-container",
        TURNSTILE_SITE_KEY,
        {
          onSuccess: () => {
            uiManager.updateSubmitButton();
          },
          onError: (errorCode: string) => {
            uiManager.updateSubmitButton();
            uiManager.showMessage(
              "error",
              "Captcha failed. Try again. (" + errorCode + ")",
            );
          },
          onExpired: () => {
            uiManager.updateSubmitButton();
            uiManager.showMessage(
              "error",
              "Captcha expired. Complete it again.",
            );
          },
        },
      );
    }
  };

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", onFirstInput);
  });
};

form.addEventListener("submit", handleSubmit);
initializeTurnstile();
uiManager.updateSubmitButton();
