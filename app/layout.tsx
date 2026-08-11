import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dalil | دليل — Apprendre à vérifier",
  description: "Assistant bilingue français-arabe pour analyser les informations et développer l’esprit critique.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
