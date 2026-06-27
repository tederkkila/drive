import React from "react";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';

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

export default async function RootLayout({
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
          <Theme radius="medium">
            {children}
            {/*<ThemePanel />*/}
            <Analytics />
          </Theme>
      </NuqsAdapter>
      </body>
    </html>
  );
}
