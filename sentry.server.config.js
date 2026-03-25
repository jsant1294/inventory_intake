import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0',
  tracesSampleRate: 1.0,
  // Add more options as needed
});
