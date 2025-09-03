import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

const adsCollection = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/ads" }),
  schema: ({ image }) =>
    z
      .object({
        image: z.object({
          mobile: image(),
          tablet: image(),
          desktop: image(),
        }),
        alt: z.object({
          en: z.string().min(1, "English alt text is required"),
          sv: z.string().min(1, "Swedish alt text is required"),
        }),
        href: z.object({
          external: z.boolean().default(false),
          link: z.string().min(1, "Must be a valid link"),
        }),
      })
      .strict(),
});

const authorCollection = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/authors" }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string().min(1, "Author name is required"),
        avatar: image(),
        bio: z.object({
          en: z.string().min(1, "English bio is required"),
          sv: z.string().min(1, "Swedish bio is required"),
        }),
        location: z.string().optional(),
        email: z.string().email("Must be a valid email").optional(),
        socialLinks: z
          .object({
            linkedin: z.string().url("Must be a valid LinkedIn URL").optional(),
            github: z.string().url("Must be a valid GitHub URL").optional(),
            website: z.string().url("Must be a valid Website URL").optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        author: z
          .array(reference("authorCollection"))
          .min(1, "At least one author is required"),
        publishedDate: z.string().datetime("Invalid date format"),
        thumbnailImg: image(),
        thumbnailImgAlt: z.string().min(1, "Image alt text is required"),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
      })
      .strict(),
});

const clientsCollection = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/clients" }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string().min(1, "Client name is required"),
        description: z.object({
          en: z.string().min(1, "English description is required"),
          sv: z.string().min(1, "Swedish description is required"),
        }),
        logo: z.object({
          light: image(),
          dark: image().optional(),
        }),
        dominantColor: z.object({
          light: z
            .string()
            .regex(
              /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
              "Must be a valid hex color",
            ),
          dark: z
            .string()
            .regex(
              /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
              "Must be a valid hex color",
            )
            .optional(),
        }),
        website: z.string().url("Must be a valid URL").optional(),
        socialLinks: z
          .object({
            youtube: z.string().url("Must be a valid YouTube URL").optional(),
            linkedin: z.string().url("Must be a valid LinkedIn URL").optional(),
            instagram: z
              .string()
              .url("Must be a valid Instagram URL")
              .optional(),
            facebook: z.string().url("Must be a valid Facebook URL").optional(),
          })
          .strict()
          .optional(),
        testimonial: z
          .object({
            quote: z.object({
              en: z.string().min(1, "English quote is required"),
              sv: z.string().min(1, "Swedish quote is required"),
            }),
            author: z.object({
              avatar: image(),
              name: z.string().min(1, "Author name is required"),
              title: z.object({
                en: z.string().min(1, "English title is required"),
                sv: z.string().min(1, "Swedish title is required"),
              }),
            }),
          })
          .optional(),
      })
      .strict(),
});

const faqCollection = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/faq" }),
  schema: z
    .object({
      categoryLabel: z.object({
        en: z.string().min(1, "English category label is required"),
        sv: z.string().min(1, "Swedish category label is required"),
      }),
      items: z
        .array(
          z.object({
            question: z.object({
              en: z.string().min(1, "English question is required"),
              sv: z.string().min(1, "Swedish question is required"),
            }),
            answer: z.object({
              en: z.string().min(1, "English answer is required"),
              sv: z.string().min(1, "Swedish answer is required"),
            }),
          }),
        )
        .min(1, "At least one FAQ item is required"),
    })
    .strict(),
});

const legalCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/legal" }),
  schema: z
    .object({
      title: z.string().min(1, "Title is required"),
      lastUpdated: z.string().datetime("Invalid date format"),
    })
    .strict(),
});

const portfolioCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/portfolio" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        category: z.string().min(1, "Category is required"),
        publishedDate: z.string().datetime("Invalid date format"),
        thumbnailImg: image(),
        thumbnailImgAlt: z.string().min(1, "Image alt text is required"),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
      })
      .strict(),
});

const servicesCollection = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/services" }),
  schema: z
    .object({
      title: z.object({
        en: z.string().min(1, "English title is required"),
        sv: z.string().min(1, "Swedish title is required"),
      }),
      description: z.object({
        en: z.string().min(1, "English description is required"),
        sv: z.string().min(1, "Swedish description is required"),
      }),
      icon: z.string().min(1, "Icon name is required"),
      featured: z.boolean().default(false),
      category: z.object({
        en: z.string().min(1, "English category is required"),
        sv: z.string().min(1, "Swedish category is required"),
      }),
      order: z.number().min(0, "Order must be a positive number").default(0),
    })
    .strict(),
});

export const collections = {
  adsCollection,
  authorCollection,
  blogCollection,
  clientsCollection,
  faqCollection,
  legalCollection,
  portfolioCollection,
  servicesCollection,
};
