import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gong365kr.vercel.app";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "창업머니맵";
const defaultAdsensePublisherId = "ca-pub-3050601904412736";
const defaultGoogleSiteVerification = "KzXCRzOdWolZAjS1EDgmX9PKMKklb2ILHO0vIv0fRGA";
const defaultNaverSiteVerification = "66f0f3f9b53c2c92af321f493745658e8843db7f";
const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? defaultAdsensePublisherId;
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION ?? defaultGoogleSiteVerification;
const naverSiteVerification = process.env.NAVER_VERIFICATION ?? defaultNaverSiteVerification;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | 창업지원금 공고 모음`,
    template: `%s | ${siteName}`
  },
  description: "창업지원사업, 정책자금, 지자체 보조금을 한곳에서 비교하고 자격 적합도를 확인하세요.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: `${siteName} | 창업지원금 공고 모음`,
    description: "예비창업자와 초기 창업자를 위한 정부 지원사업 탐색 서비스입니다.",
    url: siteUrl,
    siteName,
    locale: "ko_KR",
    type: "website"
  },
  verification: {
    google: googleSiteVerification,
    other: {
      "naver-site-verification": naverSiteVerification
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {adsenseClient ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
