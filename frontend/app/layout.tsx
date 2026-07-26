import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BookmarkProvider } from "@/components/providers/bookmark-provider";
import { Navbar } from "@/components/layout/navbar";
import { Poppins, Nunito_Sans } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Pwa } from "@/components/pwa/pwa";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});
export const metadata: Metadata = {
  title: "InternGuide",
  description: "Verified internship reviews for students in Rwanda.",
  // makes iOS treat it as an installable app with our name and icon
  appleWebApp: {
    capable: true,
    title: "InternGuide",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

// theme_color for the browser/OS UI (status bar tint on mobile)
export const viewport: Viewport = {
  themeColor: "#18815a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${nunitoSans.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <AuthProvider>
          <BookmarkProvider>
            {/* keyboard users can jump straight past the nav to the content */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            {/* global toast notifications; top-center stays clear of the mobile keyboard */}
            <Toaster position="top-center" richColors closeButton />
            <Navbar />
            <main
              id="main-content"
              tabIndex={-1}
              className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 focus:outline-none"
            >
              {children}
            </main>
            <Footer />
            <Pwa />
          </BookmarkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}