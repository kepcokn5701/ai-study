import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 기초 교육",
  description: "전력산업 종사자를 위한 인터랙티브 AI 학습 가이드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f1f5f9" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
