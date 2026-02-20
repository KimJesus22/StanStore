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
  output: "standalone",
  transpilePackages: ['styled-components'],
  turbopack: {},
  images: {
    // loader: 'custom',
    // loaderFile: './src/lib/cloudinaryLoader.ts',
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all domains for demo purposes since StanStore might fetch from anywhere
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
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
  env: {
    // Mock for build time if missing
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build',
  },
  experimental: {
    staleTimes: {
      dynamic: 30,  // 30 segundos para rutas dinámicas
      static: 180,  // 3 minutos para rutas estáticas
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(withBundleAnalyzer(withNextIntl(withPWA(nextConfig))), {
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


