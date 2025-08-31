import { TURNSTILE_SITE_KEY } from "astro:env/client";
import { createTurnstileManager } from "./turnstile";
import { extractErrorMessage } from "./actionErrorHandler";

export interface FormElements {
  form: HTMLFormElement;
  submitBtn: HTMLButtonElement;
  successMessage: HTMLElement;
  errorMessage: HTMLElement;
  errorText: HTMLElement;
  turnstileContainer: string;
}

export interface FormConfig {
  elements: FormElements;
  action: (formData: FormData) => Promise<{ error?: any }>;
  inputSelector?: string;
}

/**
 * Creates a UI manager for handling form messages and button states
 */
const createUIManager = (elements: FormElements, turnstileManager: any) => {
  const toggleElement = (element: HTMLElement, show: boolean) => {
    element.classList.toggle("hidden", !show);
    element.classList.toggle("flex", show);
  };

  const showMessage = (type: "success" | "error", message?: string) => {
    const isSuccess = type === "success";
    toggleElement(elements.successMessage, isSuccess);
    toggleElement(elements.errorMessage, !isSuccess);

    if (!isSuccess && message) {
      elements.errorText.textContent = message;
    }
  };

  const hideMessages = () => {
    toggleElement(elements.successMessage, false);
    toggleElement(elements.errorMessage, false);
  };

  const setButtonState = (
    disabled: boolean,
    opacity: string = "",
    title: string = "",
  ) => {
    elements.submitBtn.disabled = disabled;
    elements.submitBtn.style.opacity = opacity;
    elements.submitBtn.title = title;
  };

  const updateSubmitButton = () => {
    const hasToken = turnstileManager.hasValidToken();
    setButtonState(
      !hasToken,
      hasToken ? "" : "0.5",
      hasToken ? "" : "Complete the captcha first",
    );
  };

  return {
    toggleElement,
    showMessage,
    hideMessages,
    setButtonState,
    updateSubmitButton,
  };
};

/**
 * Creates a form submission handler
 */
const createSubmitHandler =
  (
    elements: FormElements,
    action: (formData: FormData) => Promise<{ error?: any }>,
    uiManager: any,
    turnstileManager: any,
  ) =>
  async (event: Event) => {
    event.preventDefault();

    if (!turnstileManager.hasValidToken()) {
      uiManager.showMessage("error", "Complete the captcha before submitting.");
      return;
    }

    uiManager.hideMessages();
    uiManager.setButtonState(true, "0.5");

    try {
      const formData = new FormData(elements.form);
      formData.set("cf-turnstile-response", turnstileManager.token!);

      const { error } = await action(formData);
      if (error) {
        throw new Error(extractErrorMessage(error));
      }

      uiManager.showMessage("success");
      elements.form.reset();
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
const initializeTurnstile = (
  elements: FormElements,
  uiManager: any,
  turnstileManager: any,
  inputSelector: string = "input, textarea, select",
) => {
  const listeners: Array<{ el: Element; type: string; fn: EventListener }> = [];

  const onFirstInput = () => {
    uiManager.hideMessages();

    if (!turnstileManager.rendered) {
      turnstileManager.render(elements.turnstileContainer, TURNSTILE_SITE_KEY, {
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
          uiManager.showMessage("error", "Captcha expired. Complete it again.");
        },
      });
    }
  };

  elements.form.querySelectorAll(inputSelector).forEach((input) => {
    const inputHandler = onFirstInput;
    input.addEventListener("input", inputHandler);
    listeners.push({ el: input, type: "input", fn: inputHandler });

    if (input.tagName === "SELECT") {
      const changeHandler = onFirstInput;
      input.addEventListener("change", changeHandler);
      listeners.push({ el: input, type: "change", fn: changeHandler });
    }
  });

  return () => {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
  };
};

/**
 * Main function to initialize a form with Turnstile and validation
 */
export const initializeForm = (config: FormConfig) => {
  const turnstileManager = createTurnstileManager();
  const uiManager = createUIManager(config.elements, turnstileManager);

  const handleSubmit = createSubmitHandler(
    config.elements,
    config.action,
    uiManager,
    turnstileManager,
  );

  config.elements.form.addEventListener("submit", handleSubmit);
  const removeInputListeners = initializeTurnstile(
    config.elements,
    uiManager,
    turnstileManager,
    config.inputSelector || "input, textarea, select",
  );

  uiManager.updateSubmitButton();

  return () => {
    config.elements.form.removeEventListener("submit", handleSubmit);
    removeInputListeners?.();
    turnstileManager.reset();
  };
};
