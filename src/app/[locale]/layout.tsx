import Providers from '@/components/Providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import StyledComponentsRegistry from '@/lib/registry';
import Navbar from '@/components/Navbar';
import { CartDrawer } from '@/features/cart';
import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { Toaster } from 'react-hot-toast';
import { locales } from '@/navigation';
import '../globals.css';
import type { Viewport } from 'next';
import dynamicLoader from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import { WebVitals } from '@/components/WebVitals';
import SkipLink from '@/components/ui/SkipLink';
import RouteAnnouncer from '@/components/RouteAnnouncer';
import AxeReporter from '@/components/AxeReporter';

// Lazy loading de componentes "Below the Fold" o interactivos no críticos
const Footer = dynamicLoader(() => import('@/components/Footer'), {
  loading: () => <div style={{ padding: '2rem' }}><Skeleton $height="300px" /></div>
});

import { DynamicCookieBanner, DynamicInstallPrompt, DynamicGoogleAnalytics } from '@/components/ClientLayoutHelpers';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      default: t('title'),
      template: `%s | StanStore`
    },
    description: t('description'),
    manifest: "/manifest.json",
    icons: {
      apple: "/icons/icon-192x192.svg",
    }
  };
}

export const viewport: Viewport = {
  themeColor: "#10CFBD",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale;
  // Validate that the incoming `locale` parameter is valid
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!locales.includes(locale as any)) notFound();

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} timeZone="America/Mexico_City">
          <Providers>
            <StyledComponentsRegistry>
              <DynamicGoogleAnalytics gaId="G-XXXXXXXXXX" />
              <Toaster position="bottom-center" />
              <ThemeProvider>
                <AuthProvider>
                  <CurrencyProvider>
                    <SkipLink />
                    <RouteAnnouncer />
                    <AxeReporter />
                    <Navbar />
                    <WebVitals />
                    <CartDrawer />
                    <DynamicInstallPrompt />
                    <main id="content">
                      {children}
                    </main>
                    <Footer />
                  </CurrencyProvider>
                </AuthProvider>
                <DynamicCookieBanner />
              </ThemeProvider>
            </StyledComponentsRegistry>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
