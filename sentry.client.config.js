import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://9c914ee64b836710739b2df03fb63068@o4509722695892992.ingest.de.sentry.io/4509722744979536",
  sendDefaultPii: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  enableLogs: true,
  tracesSampleRate: 0.5,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
