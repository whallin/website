import { actions } from "astro:actions";
import { initializeForm } from "../../utils/formHandler";

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

initializeForm({
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
