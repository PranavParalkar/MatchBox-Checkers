import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matchbox Checkers — AI Learning Game",
  description:
    "A 4×4 mini-checkers game where a matchbox AI learns to play through reinforcement learning. Watch the computer get smarter over time!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
