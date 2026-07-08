import { PropsWithChildren } from "react";

import { Spline_Sans } from "next/font/google";

import type { Metadata } from "next";
import "@/app/globals.css";
import { getServerSession } from "next-auth";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { config } from "@/app/auth/api/[...nextauth]/config";

import IntroModal from "@/containers/intro-modal";
import MainNav from "@/containers/nav";

import PrivacyBanner from "@/components/privacy-banner";
import { SidebarProvider } from "@/components/ui/sidebar";
import Toaster from "@/components/ui/toast/toaster";
import GoogleAnalytics from "@/scripts/google-analytics";

import LayoutProviders from "./providers";

const inter = Spline_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spline-sans",
});

export const metadata: Metadata = {
  title: "Blue Carbon Cost Tool",
  description:
    "The Blue Carbon Cost Tool estimates project costs and carbon benefits of Blue Carbon Market projects, providing a high-level view for comparisons and prioritization among difference project scenarios.",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<PropsWithChildren>) {
  const session = await getServerSession(config);

  return (
    <LayoutProviders session={session}>
      <html lang="en">
        <NuqsAdapter>
          <body className={inter.className}>
            <SidebarProvider>
              <MainNav />
              <IntroModal />
              <main className="flex h-dvh flex-1">{children}</main>
            </SidebarProvider>
            <Toaster />
            <PrivacyBanner />
            <GoogleAnalytics />
          </body>
        </NuqsAdapter>
      </html>
    </LayoutProviders>
  );
}
