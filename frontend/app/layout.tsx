import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BookmarkProvider } from "@/components/providers/bookmark-provider";
import { Navbar } from "@/components/layout/navbar";
import { Poppins, Nunito_Sans } from "next/font/google";
import { Footer } from "@/components/layout/footer";

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
          </BookmarkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}