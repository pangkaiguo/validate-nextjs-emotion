import type { Metadata } from "next";
import "./globals.css";
import EmotionRegistry from "@/lib/emotion-registry";

export const metadata: Metadata = {
  title: "Validate Next.js + Emotion",
  description: "A project to validate Emotion CSS-in-JS support in Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  );
}
