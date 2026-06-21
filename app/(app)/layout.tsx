import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/client";

import { Theme, ThemePanel } from "@radix-ui/themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drive",
  description: "Driven to Win",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <NuqsAdapter>
        <TRPCReactProvider>
          <Theme radius="medium">
            {children}
            {/*<ThemePanel />*/}
          </Theme>
        </TRPCReactProvider>
      </NuqsAdapter>
      </body>
    </html>
  );
}
