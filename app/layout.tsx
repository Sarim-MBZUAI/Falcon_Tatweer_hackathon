import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hakim AI · Evidence for local entrepreneurs",
  description:
    "Hakim AI is a bilingual (Arabic & English) market-research avatar that helps local entrepreneurs in rural communities decide with evidence instead of guesswork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${arabic.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
