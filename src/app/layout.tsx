import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// Primary font: Inter for English
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Secondary font: Noto Sans KR for Korean
const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ondo - 서울의 겨울",
  description: "실시간 서울 날씨와 감성 비서. 2.5D 시네마틱 뷰로 도시의 분위기를느껴보세요.",
  keywords: ["날씨", "서울", "겨울", "Ondo", "감성", "여행", "Weather", "Seoul"],
  authors: [{ name: "Ondo Team" }],
  openGraph: {
    title: "Ondo - 서울의 겨울",
    description: "현재 서울의 온도와 분위기를 2.5D 디오라마로 경험하세요.",
    url: "https://ondo.today",
    siteName: "Ondo",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Ensure this image exists in public folder later
        width: 1200,
        height: 630,
        alt: "Ondo - Seoul Winter Diorama",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ondo - 서울의 겨울",
    description: "실시간 서울 날씨와 감성 비서",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ondo",
  },
  formatDetection: {
    telephone: false,
  },
};

// Mobile-optimized viewport settings
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClasses = `${inter.variable} ${notoSansKR.variable}`;

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${fontClasses} overflow-hidden touch-none select-none`}
        suppressHydrationWarning
      >
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}

