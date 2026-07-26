import type { MetadataRoute } from "next";

// Web app manifest - what makes InternGuide installable to the home screen.
// Next serves this at /manifest.webmanifest and links it automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InternGuide",
    short_name: "InternGuide",
    description:
      "Verified internship reviews for students in Rwanda - mentorship, tasks and learning, rated by people who did the work.",
    start_url: "/",
    scope: "/",
    display: "standalone", // opens full-screen, no browser chrome
    orientation: "portrait",
    background_color: "#ffffff", // splash screen background
    theme_color: "#18815a", // status bar / toolbar tint (brand green)
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
