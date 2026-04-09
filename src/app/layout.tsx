import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        {/* Anti-Next Logo CSS injection */}
        <style dangerouslySetInnerHTML={{ __html: `
          [data-nextjs-static-indicator], 
          .nextjs-static-indicator-container, 
          #nextjs-dev-overlay { 
            display: none !important; 
          }
        `}} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
