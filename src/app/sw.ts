/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly, CacheFirst, StaleWhileRevalidate, ExpirationPlugin } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
         
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher: ({ url }: { url: URL }) =>
                url.pathname.startsWith("/api/") ||
                url.pathname.includes("/checkout") ||
                (url.hostname.includes("supabase.co") && url.pathname.includes("/auth/v1/")),
            handler: new NetworkOnly(),
        },
        {
            matcher: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*$/i,
            handler: new CacheFirst({
                cacheName: "supabase-images",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 100,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                    }),
                ],
            }),
        },
        {
            matcher: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: new StaleWhileRevalidate({
                cacheName: "google-fonts",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 8,
                        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Year
                    }),
                ],
            }),
        },
        ...defaultCache,
    ],
    fallbacks: {
        entries: [
            {
                url: "/~offline",
                matcher: ({ request }) => request.mode === "navigate",
            },
        ],
    },
});

serwist.addEventListeners();
