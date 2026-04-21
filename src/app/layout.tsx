import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-custom-heading",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-custom-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-custom-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUMINA | Inteligencia Digital Signage",
  description: "Plataforma SaaS avanzada para la gestión dinámica de pantallas publicitarias.",
  icons: {
    icon: "/logo.png",
  },
  manifest: "/manifest.json",
};

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
