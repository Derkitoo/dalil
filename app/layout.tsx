import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "دليل — فكّر قبل أن تنشر",
  description: "مساعد عربي للتحقّق من المعلومات وتعلّم التفكير النقدي.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
