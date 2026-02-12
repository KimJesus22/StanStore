import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
        Sentry.replayIntegration({
            // Additional Replay configuration goes here,
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
    beforeSend(event: Sentry.ErrorEvent) {
        if (event.request?.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['cookie'];
        }
        // Sanitize user inputs if present in breadcrumbs or other contexts
        return event;
    },
});
