import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="font-sans antialiased">
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}