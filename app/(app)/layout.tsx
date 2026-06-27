import React from "react";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { Metadata } from "next";
import { headers } from 'next/headers';
import { TRPCReactProvider } from "@/trpc/client";
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

  //solve trpc www fallback issue
  const headersList = await headers();

  const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') ?? 'https';

  const origin = `${proto}://${host}`;

  console.log('origin', origin);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <NuqsAdapter>
        <TRPCReactProvider url={origin}>
          <Theme radius="medium">
            {children}
            {/*<ThemePanel />*/}
            <Analytics />
          </Theme>
        </TRPCReactProvider>
      </NuqsAdapter>
      </body>
    </html>
  );
}
