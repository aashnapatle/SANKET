import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SANKET — Financial Investigation Console",
  description: "Offline-first financial transaction investigation and money-flow intelligence platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
