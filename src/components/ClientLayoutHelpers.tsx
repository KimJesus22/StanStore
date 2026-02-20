'use client';

import dynamic from 'next/dynamic';

const CookieBanner = dynamic(() => import('@/components/CookieBanner'), { ssr: false });
const InstallPrompt = dynamic(() => import('@/components/InstallPrompt'), { ssr: false });
const GoogleAnalytics = dynamic(() => import('@/components/GoogleAnalytics'), { ssr: false });

export const DynamicCookieBanner = CookieBanner;
export const DynamicInstallPrompt = InstallPrompt;
export const DynamicGoogleAnalytics = GoogleAnalytics;
export const DynamicThirdPartyScripts = dynamic(() => import('@/components/ThirdPartyScripts'), { ssr: false });
