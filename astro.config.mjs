// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://hallin.media",

  adapter: cloudflare({
    imageService: "compile",
    platformProxy: {
      enabled: true,
    },
  }),

  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 1,
      lastmod: new Date(),
      i18n: {
        defaultLocale: "sv",
        locales: {
          sv: "sv-SE",
          en: "en-US",
        },
      },
    }),
    mdx(),
    sentry({
      sourceMapsUploadOptions: {
        project: "website",
        org: "hallinmedia",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  prefetch: {
    defaultStrategy: "viewport",
  },

  image: {
    responsiveStyles: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "hallin.media",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },

  i18n: {
    defaultLocale: "sv",
    locales: ["sv", "en"],
  },

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
      TURNSTILE_SITE_KEY: envField.string({
        context: "client",
        access: "public",
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },

  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Geist",
        cssVariable: "--font-geist",
        weights: ["100 900"],
      },
      {
        provider: fontProviders.google(),
        name: "Instrument Serif",
        cssVariable: "--font-instrument-serif",
        weights: ["400"],
      },
      {
        provider: fontProviders.google(),
        name: "Geist Mono",
        cssVariable: "--font-geist-mono",
        weights: ["100 900"],
      },
      {
        provider: fontProviders.google(),
        name: "Schoolbell",
        cssVariable: "--font-schoolbell",
        weights: ["400"],
      },
    ],

    clientPrerender: true,
    contentIntellisense: true,
  },
});
