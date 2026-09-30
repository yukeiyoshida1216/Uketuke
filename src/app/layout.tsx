import type { Metadata, Viewport } from "next";
import { copy, preloadedPhotos, theme } from "@/config/reception";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.appTitle,
  description: copy.welcomeSubtitle,
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: copy.appTitle,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: theme.background,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-dvh antialiased">
      <head>
        <link rel="preload" href="/logo-mark.svg" as="image" />
        <link rel="preload" href="/logo-wordmark.svg" as="image" />
        {preloadedPhotos.map((href) => (
          <link key={href} rel="preload" href={href} as="image" />
        ))}
      </head>
      <body
        className="h-dvh overflow-hidden"
        style={{ fontFamily: theme.fontFamily, background: theme.background, color: theme.ink }}
      >
        {children}
      </body>
    </html>
  );
}
