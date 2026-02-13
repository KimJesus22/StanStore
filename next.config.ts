import withPWAInit from "@ducanh2912/next-pwa";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    // loader: 'custom',
    // loaderFile: './src/lib/cloudinaryLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all domains for demo purposes since StanStore might fetch from anywhere
      },
    ],
  },
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
      fileName: true,
    },
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(withNextIntl(withPWA(nextConfig)), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "stanstore-org",
  project: "stanstore-project",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  // disableLogger: true, // Deprecated




});


