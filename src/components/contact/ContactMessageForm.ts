import { actions } from "astro:actions";
import { initializeForm } from "../../utils/formHandler";

const form = document.getElementById("contact-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const successMessage = document.getElementById(
  "success-message",
) as HTMLElement;
const errorMessage = document.getElementById("error-message") as HTMLElement;
const errorText = document.getElementById("error-text") as HTMLElement;

initializeForm({
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
