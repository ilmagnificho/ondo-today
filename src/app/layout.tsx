import type { Metadata, Viewport } from "next";
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
  title: "Ondo - 오늘의 온도",
  description: "Experience your city's weather through a cinematic 2.5D view.",
  keywords: ["weather", "seoul", "cinematic", "mobile", "temperature", "ondo"],
  authors: [{ name: "Ondo" }],
  openGraph: {
    title: "Ondo - 오늘의 온도",
    description: "Feel the mood of the weather in your city.",
    url: "https://ondo.today",
    siteName: "Ondo",
    type: "website",
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
      </body>
    </html>
  );
}

