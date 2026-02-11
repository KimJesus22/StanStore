import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "StanStore",
  description: "E-commerce portfolio project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <StyledComponentsRegistry>
          <Toaster position="bottom-center" />
          <Navbar />
          <CartDrawer />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
