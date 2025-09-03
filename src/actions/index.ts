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
 * Creates HTML email template for licensing requests
 * @param data - The licensing request data
 * @returns HTML string for the email
 */
function createEmailLicensingTemplate(data: {
  name: string;
  email: string;
  company: string;
  phone?: string;
  licenseType: string;
  usageType: string;
  budgetRange: string;
  usageScope: string;
  specificAssets: string;
  projectDescription: string;
  additionalRequirements?: string;
  neededBy: string;
  duration: string;
}): string {
  return `
    <h2>New Licensing Request</h2>
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Company:</strong> ${data.company}</p>
    ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
    
    <h3>Licensing Details</h3>
    <p><strong>License Type:</strong> ${data.licenseType}</p>
    <p><strong>Intended Use:</strong> ${data.usageType}</p>
    <p><strong>Budget Range:</strong> ${data.budgetRange}</p>
    <p><strong>Usage Scope:</strong> ${data.usageScope}</p>
    <p><strong>License Duration:</strong> ${data.duration}</p>
    <p><strong>Needed By:</strong> ${data.neededBy}</p>
    
    <h3>Project Details</h3>
    <p><strong>Specific Assets:</strong></p>
    <p>${data.specificAssets.replace(/\n/g, "<br>")}</p>
    
    <p><strong>Project Description:</strong></p>
    <p>${data.projectDescription.replace(/\n/g, "<br>")}</p>
    
    ${data.additionalRequirements ? `<p><strong>Additional Requirements:</strong></p><p>${data.additionalRequirements.replace(/\n/g, "<br>")}</p>` : ""}
  `;
}

/**
 * Creates HTML email template for project inquiries
 * @param data - The project inquiry data
 * @returns HTML string for the email
 */
function createEmailProjectInquiryTemplate(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  serviceType: string;
  projectScale?: string;
  budget: string;
  timeline: string;
  projectDescription: string;
  additionalInfo?: string;
  referralSource?: string;
}): string {
  return `
    <h2>New Project Inquiry</h2>
    <h3>Contact Information</h3>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ""}
    ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
    
    <h3>Project Details</h3>
    <p><strong>Primary Service:</strong> ${data.serviceType}</p>
    ${data.projectScale ? `<p><strong>Project Scale:</strong> ${data.projectScale}</p>` : ""}
    <p><strong>Budget Range:</strong> ${data.budget}</p>
    <p><strong>Target Timeline:</strong> ${data.timeline}</p>
    
    <h3>Project Description</h3>
    <p>${data.projectDescription.replace(/\n/g, "<br>")}</p>
    
    ${data.additionalInfo ? `<h3>Additional Information</h3><p>${data.additionalInfo.replace(/\n/g, "<br>")}</p>` : ""}
    
    <h3>Other Details</h3>
    ${data.referralSource ? `<p><strong>How they heard about me:</strong> ${data.referralSource}</p>` : ""}
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
          to: ["william@hallin.media"],
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
   * Validates the email address and first name, verifies turnstile token, and adds contact to Resend audience
   *
   * @param input - Form data containing first name, email and turnstile token
   * @param context - Astro action context containing request information
   * @returns Promise resolving to success status and contact data
   * @throws ActionError for validation failures or subscription errors
   */
  subscribeToNewsletter: defineAction({
    accept: "form",
    input: z.object({
      firstName: z.string().min(1, "First name is required"),
      email: z.string().email("Please enter a valid email address"),
      "cf-turnstile-response": z
        .string()
        .min(1, "Please complete the verification"),
    }),

    handler: async (
      { firstName, email, "cf-turnstile-response": turnstileToken },
      context,
    ) => {
      const clientIp = getClientIp(context.request);
      await validateTurnstileToken(turnstileToken, clientIp);

      try {
        const { data, error } = await resend.contacts.create({
          email: email,
          firstName: firstName,
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

  /**
   * Handles licensing request form submissions with turnstile verification
   * Validates the form data, verifies turnstile token, and sends email via Resend
   *
   * @param input - Form data containing licensing request details and turnstile token
   * @param context - Astro action context containing request information
   * @returns Promise resolving to success status and email data
   * @throws ActionError for validation failures or email sending errors
   */
  sendLicensingRequest: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Please enter a valid email address"),
      company: z.string().min(1, "Company is required"),
      phone: z.string().optional(),
      license_type: z.string().min(1, "License type is required"),
      usage_type: z.string().min(1, "Usage type is required"),
      budget_range: z.string().min(1, "Budget range is required"),
      usage_scope: z.string().min(1, "Usage scope is required"),
      specific_assets: z
        .string()
        .min(10, "Please provide details about the specific assets"),
      project_description: z
        .string()
        .min(50, "Project description must be at least 50 characters long"),
      additional_requirements: z.string().optional(),
      needed_by: z.string().min(1, "Timeline is required"),
      duration: z.string().min(1, "License duration is required"),
      "cf-turnstile-response": z
        .string()
        .min(1, "Please complete the verification"),
    }),

    handler: async (
      {
        name,
        email,
        company,
        phone,
        license_type,
        usage_type,
        budget_range,
        usage_scope,
        specific_assets,
        project_description,
        additional_requirements,
        needed_by,
        duration,
        "cf-turnstile-response": turnstileToken,
      },
      context,
    ) => {
      const clientIp = getClientIp(context.request);
      await validateTurnstileToken(turnstileToken, clientIp);

      try {
        const { data, error } = await resend.emails.send({
          from: "Licensing Request via Website <www@re.hallin.media>",
          to: ["william@hallin.media"],
          subject: `New licensing request from ${name} (${company})`,
          html: createEmailLicensingTemplate({
            name,
            email,
            company,
            phone,
            licenseType: license_type,
            usageType: usage_type,
            budgetRange: budget_range,
            usageScope: usage_scope,
            specificAssets: specific_assets,
            projectDescription: project_description,
            additionalRequirements: additional_requirements,
            neededBy: needed_by,
            duration,
          }),
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
   * Handles project inquiry form submissions with turnstile verification
   * Validates the form data, verifies turnstile token, and sends email via Resend
   *
   * @param input - Form data containing project inquiry details and turnstile token
   * @param context - Astro action context containing request information
   * @returns Promise resolving to success status and email data
   * @throws ActionError for validation failures or email sending errors
   */
  sendProjectInquiry: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Please enter a valid email address"),
      company: z.string().optional(),
      phone: z.string().optional(),
      service_type: z.string().min(1, "Primary service is required"),
      project_scale: z.string().optional(),
      budget: z.string().min(1, "Budget range is required"),
      timeline: z.string().min(1, "Timeline is required"),
      project_description: z
        .string()
        .min(50, "Project description must be at least 50 characters long"),
      additional_info: z.string().optional(),
      referral_source: z.string().optional(),
      newsletter_signup: z.string().optional(),
      "cf-turnstile-response": z
        .string()
        .min(1, "Please complete the verification"),
    }),

    handler: async (
      {
        name,
        email,
        company,
        phone,
        service_type,
        project_scale,
        budget,
        timeline,
        project_description,
        additional_info,
        referral_source,
        newsletter_signup,
        "cf-turnstile-response": turnstileToken,
      },
      context,
    ) => {
      const clientIp = getClientIp(context.request);
      await validateTurnstileToken(turnstileToken, clientIp);

      try {
        const { data, error } = await resend.emails.send({
          from: "Project Inquiry via Website <www@re.hallin.media>",
          to: ["william@hallin.media"],
          subject: `New project inquiry from ${name}${company ? ` (${company})` : ""}`,
          html: createEmailProjectInquiryTemplate({
            name,
            email,
            company,
            phone,
            serviceType: service_type,
            projectScale: project_scale,
            budget,
            timeline,
            projectDescription: project_description,
            additionalInfo: additional_info,
            referralSource: referral_source,
          }),
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
};
