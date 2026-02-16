import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import StyledComponentsRegistry from '@/lib/registry';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import AuthProvider from '@/components/AuthProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { Toaster } from 'react-hot-toast';
import { locales } from '@/navigation';
import '../globals.css';
import type { Metadata, Viewport } from 'next';
import dynamicLoader from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import { WebVitals } from '@/components/WebVitals';

// Lazy loading de componentes "Below the Fold" o interactivos no críticos
const Footer = dynamicLoader(() => import('@/components/Footer'), {
  loading: () => <div style={{ padding: '2rem' }}><Skeleton $height="300px" /></div>
});

const CookieBanner = dynamicLoader(() => import('@/components/CookieBanner'), { ssr: false });
const InstallPrompt = dynamicLoader(() => import('@/components/InstallPrompt'), { ssr: false });
const GoogleAnalytics = dynamicLoader(() => import('@/components/GoogleAnalytics'), { ssr: false });

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
        <NextIntlClientProvider messages={messages}>
          <StyledComponentsRegistry>
            <GoogleAnalytics gaId="G-XXXXXXXXXX" />
            <Toaster position="bottom-center" />
            <ThemeProvider>
              <AuthProvider>
                <CurrencyProvider>
                  <Navbar />
                  <WebVitals />
                  <CartDrawer />
                  <InstallPrompt />
                  {children}
                  <Footer />
                </CurrencyProvider>
              </AuthProvider>
              <CookieBanner />
            </ThemeProvider>
          </StyledComponentsRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
