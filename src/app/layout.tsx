import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HITO LOG | 人生時間可視化プロトタイプ',
  description:
    '人生の残り時間・人間関係・目標達成のペースを一つのダッシュボードで確認できるプロトタイプです。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
