import { actions } from "astro:actions";
import { initializeForm } from "../../utils/formHandler";

const form = document.getElementById("project-inquiry-form") as HTMLFormElement;
const submitBtn = document.getElementById(
  "project-submit-btn",
) as HTMLButtonElement;
const successMessage = document.getElementById(
  "project-success-message",
) as HTMLElement;
const errorMessage = document.getElementById(
  "project-error-message",
) as HTMLElement;
const errorText = document.getElementById("project-error-text") as HTMLElement;

initializeForm({
  elements: {
    form,
    submitBtn,
    successMessage,
    errorMessage,
    errorText,
    turnstileContainer: "#turnstile-container",
  },
  action: actions.sendProjectInquiry,
});
