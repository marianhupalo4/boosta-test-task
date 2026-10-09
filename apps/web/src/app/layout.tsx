import type { Metadata } from "next";
import { Geologica, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geologica = Geologica({ variable: "--font-geologica", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ADHD Trait Test",
  description: "Find out how ADHD traits influence your focus, energy, and daily life",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geologica.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
