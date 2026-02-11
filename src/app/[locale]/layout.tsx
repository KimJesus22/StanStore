import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import StyledComponentsRegistry from '@/lib/registry';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import AuthProvider from '@/components/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { locales } from '@/navigation';
import '../globals.css';
import type { Metadata, Viewport } from 'next';
import InstallPrompt from '@/components/InstallPrompt';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "StanStore",
  description: "Tienda de K-Pop y Merch",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192x192.svg",
  }
};

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
            <Toaster position="bottom-center" />
            <AuthProvider>
              <Navbar />
              <CartDrawer />
              <InstallPrompt />
              {children}
            </AuthProvider>
          </StyledComponentsRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
