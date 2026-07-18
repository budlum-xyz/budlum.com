import type { Metadata } from "next";
import { Dosis, Mako } from "next/font/google";
import "./globals.css";

const dosis = Dosis({
  variable: "--font-dosis",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

const mako = Mako({
  variable: "--font-mako",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "budlum",
  description:
    "Budlum blokzincir gezgini — cüzdanları, tokenları ve işlemleri mekânsal bir ilişki ağı olarak keşfedin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${dosis.variable} ${mako.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
