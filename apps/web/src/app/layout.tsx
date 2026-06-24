import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../index.css";

export const metadata: Metadata = {
  title: "X-META Video",
  description: "AI comic drama, MV, and short-form video creation platform.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
