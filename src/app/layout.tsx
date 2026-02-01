import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CARAG - Car Research Aggregator",
  description: "Objective car research platform with government safety data, owner complaints, fuel economy, and expert reviews. Make smarter car buying decisions.",
  keywords: ["car research", "vehicle reliability", "NHTSA", "car reviews", "fuel economy", "car complaints", "car recalls"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
