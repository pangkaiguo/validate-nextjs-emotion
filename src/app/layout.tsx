import type { Metadata } from "next";
import "./globals.css";
import EmotionRegistry from "@/lib/emotion-registry";
import StyledComponentsRegistry from "@/lib/styled-components-registry";

export const metadata: Metadata = {
  title: "Validate Next.js + Emotion + styled-components",
  description: "A project to validate Emotion CSS-in-JS and styled-components support in Next.js App Router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <EmotionRegistry>
          <StyledComponentsRegistry>
            {children}
          </StyledComponentsRegistry>
        </EmotionRegistry>
      </body>
    </html>
  );
}
