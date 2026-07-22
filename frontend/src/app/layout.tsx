import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://studyai-fawn.vercel.app",
  ),
  title: "StudyAI | Interactive Tech Education Platform",
  description:
    "Master programming, networking, cybersecurity, cloud computing, and Linux through interactive sandboxes, visual simulators, and an AI tutor companion.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "StudyAI | Interactive Tech Education Platform",
    description:
      "Master programming, networking, cybersecurity, cloud computing, and Linux through interactive sandboxes, visual simulators, and an AI tutor companion.",
    type: "website",
    siteName: "StudyAI",
    images: ["/logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyAI | Interactive Tech Education Platform",
    description:
      "Master programming, networking, cybersecurity, cloud computing, and Linux through interactive sandboxes, visual simulators, and an AI tutor companion.",
    images: ["/logo.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
