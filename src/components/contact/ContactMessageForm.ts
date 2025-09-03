import { actions } from "astro:actions";
import { initializeForm } from "../../utils/formHandler";

let destroy: (() => void) | null = null;

const mount = () => {
  const form = document.getElementById("contact-form") as HTMLFormElement;
  const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
  const successMessage = document.getElementById(
    "success-message",
  ) as HTMLElement;
  const errorMessage = document.getElementById("error-message") as HTMLElement;
  const errorText = document.getElementById("error-text") as HTMLElement;

  destroy = initializeForm({
    elements: {
      form,
      submitBtn,
      successMessage,
      errorMessage,
      errorText,
      turnstileContainer: "#turnstile-container",
    },
    action: actions.sendContactMessage,
    inputSelector: "input, textarea",
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
