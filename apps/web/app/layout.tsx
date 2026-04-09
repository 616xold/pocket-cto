import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pocket CFO",
  description: "Evidence-native finance source ingest and operator review.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
