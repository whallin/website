import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { Resend } from "resend";
import { RESEND_API_KEY } from "astro:env/server";
import { validateTurnstile, getClientIp } from "../utils/turnstileServer";

const resend = new Resend(RESEND_API_KEY);

/**
 * Validates turnstile token and throws appropriate error if validation fails
 * @param turnstileToken - The turnstile verification token
 * @param clientIp - The client's IP address
 */
async function validateTurnstileToken(
  turnstileToken: string,
  clientIp: string,
): Promise<void> {
  const validation = await validateTurnstile(turnstileToken, clientIp);

  if (!validation.success) {
    const errorCodes = validation["error-codes"] || ["verification-failed"];
    throw new ActionError({
      code: "BAD_REQUEST",
      message: `Verification failed: ${errorCodes.join(", ")}`,
    });
  }
}

/**
 * Creates HTML email template for contact messages
 * @param name - The sender's name
 * @param email - The sender's email
 * @param message - The contact message
 * @returns HTML string for the email
 */
function createEmailContactTemplate(
  name: string,
  email: string,
  message: string,
): string {
  return `
    <h2>New Contact Message</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br>")}</p>
  `;
}

/**
 * Server actions for handling form submissions and API requests
 */
export const server = {
  /**
   * Handles contact form submissions with turnstile verification
   * Validates the form data, verifies turnstile token, and sends email via Resend
   *
   * @param input - Form data containing name, email, message, and turnstile token
   * @param context - Astro action context containing request information
   * @returns Promise resolving to success status and email data
   * @throws ActionError for validation failures or email sending errors
   */
  sendContactMessage: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Please enter a valid email address"),
      message: z
        .string()
        .min(100, "Message must be at least 100 characters long"),
      "cf-turnstile-response": z
        .string()
        .min(1, "Please complete the verification"),
    }),

    handler: async (
      { name, email, message, "cf-turnstile-response": turnstileToken },
      context,
    ) => {
      const clientIp = getClientIp(context.request);
      await validateTurnstileToken(turnstileToken, clientIp);

      try {
        const { data, error } = await resend.emails.send({
          from: "Contact via Website <www@re.hallin.media>",
          to: ["delivered@resend.dev"],
          subject: `New contact message from ${name}`,
          html: createEmailContactTemplate(name, email, message),
          replyTo: email,
        });

        if (error) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        return { success: true, data };
      } catch (err) {
        if (err instanceof ActionError) throw err;

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send. Try again later.",
        });
      }
    },
  }),

  /**
   * Handles newsletter subscription with turnstile verification
   * Validates the email address, verifies turnstile token, and adds contact to Resend audience
   *
   * @param input - Form data containing email and turnstile token
   * @param context - Astro action context containing request information
   * @returns Promise resolving to success status and contact data
   * @throws ActionError for validation failures or subscription errors
   */
  subscribeToNewsletter: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email("Please enter a valid email address"),
      "cf-turnstile-response": z
        .string()
        .min(1, "Please complete the verification"),
    }),

    handler: async (
      { email, "cf-turnstile-response": turnstileToken },
      context,
    ) => {
      const clientIp = getClientIp(context.request);
      await validateTurnstileToken(turnstileToken, clientIp);

      try {
        const { data, error } = await resend.contacts.create({
          email: email,
          unsubscribed: false,
          audienceId: "d08ca3a9-2673-4432-9199-8753384e6eb8",
        });

        if (error) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        return { success: true, data };
      } catch (err) {
        if (err instanceof ActionError) throw err;

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send. Try again later.",
        });
      }
    },
  }),
};
