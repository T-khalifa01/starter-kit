// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import siteConfig from "@/config/site.config";

Sentry.init({
  dsn: "https://4acd0a7e93c2f955637f3986de49448d@o4511707012923392.ingest.de.sentry.io/4511707073282128",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },

  //A tag to identify which dealership an event came from, since we are using shared project.
  initialScope: {
    tags: { dealership: siteConfig.dealership.slug },
  },
});
