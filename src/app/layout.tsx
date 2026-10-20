import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = { title: "MeetSlot — Simple scheduling", description: "Book time that works." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header />{children}</body></html>;
}
