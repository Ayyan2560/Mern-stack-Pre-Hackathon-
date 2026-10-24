import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackHub — Build together",
  description: "Discover hackathons, share progress, and find your next team.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
