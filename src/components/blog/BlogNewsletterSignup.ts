import { actions } from "astro:actions";
import { initializeForm } from "../../utils/formHandler";

let destroy: (() => void) | null = null;

const mount = () => {
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

  destroy = initializeForm({
    elements: {
      form,
      submitBtn,
      successMessage,
      errorMessage,
      errorText,
      turnstileContainer: "#newsletter-turnstile-container",
    },
    action: actions.subscribeToNewsletter,
    inputSelector: "input",
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
