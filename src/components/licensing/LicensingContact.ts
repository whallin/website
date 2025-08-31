import { actions } from "astro:actions";
import { initializeForm } from "../../utils/formHandler";

let destroy: (() => void) | null = null;

const mount = () => {
  const form = document.getElementById(
    "licensing-inquiry-form",
  ) as HTMLFormElement;
  const submitBtn = document.getElementById(
    "licensing-submit-btn",
  ) as HTMLButtonElement;
  const successMessage = document.getElementById(
    "licensing-success-message",
  ) as HTMLElement;
  const errorMessage = document.getElementById(
    "licensing-error-message",
  ) as HTMLElement;
  const errorText = document.getElementById(
    "licensing-error-text",
  ) as HTMLElement;

  destroy = initializeForm({
    elements: {
      form,
      submitBtn,
      successMessage,
      errorMessage,
      errorText,
      turnstileContainer: "#turnstile-container",
    },
    action: actions.sendLicensingRequest,
  });
};

mount();

document.addEventListener("astro:page-load", () => {
  destroy?.();
  mount();
});

document.addEventListener("astro:before-swap", () => {
  destroy?.();
});
