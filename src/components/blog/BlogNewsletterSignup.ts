import { actions } from "astro:actions";
import { initializeForm } from "../../utils/formHandler";

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

initializeForm({
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
