import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import { GaPageView } from "@/app/_components/ga-pageview";
import { getSiteName, getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();
const siteName = getSiteName();
const defaultAdsensePublisherId = "ca-pub-3050601904412736";
const defaultGaId = "G-5FJ0PMBPHJ";
const defaultGoogleSiteVerification =
  "KzXCRzOdWolZAjS1EDgmX9PKMKklb2ILHO0vIv0fRGA";
const defaultNaverSiteVerification = "66f0f3f9b53c2c92af321f493745658e8843db7f";

const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ??
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ??
  defaultAdsensePublisherId;
const adsenseApproved = process.env.NEXT_PUBLIC_ADSENSE_APPROVED === "true";
const gaId = process.env.NEXT_PUBLIC_GA_ID ?? defaultGaId;
const clarityEnabled = process.env.NEXT_PUBLIC_CLARITY_ENABLED === "true";
const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ?? defaultGoogleSiteVerification;
const naverSiteVerification =
  process.env.NAVER_VERIFICATION ?? defaultNaverSiteVerification;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | 창업지원사업 공고 모음`,
    template: `%s | ${siteName}`,
  },
  description:
    "공공지원사업, 지원사업 공고, 마감 임박 공고를 한 곳에서 빠르게 확인하고 신청 조건을 정리해 줍니다.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} | 창업지원사업 공고 모음`,
    description:
      "공고 정보를 빠르게 정리해 검색과 신청 흐름에 맞는 페이지로 이동할 수 있게 구성했습니다.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
      },
    ],
    url: siteUrl,
    siteName,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "창업지원사업 공고 모음",
    description:
      "지원사업·정책자금 공고와 마감일 정보를 빠르게 확인할 수 있는 채널입니다.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: googleSiteVerification,
    other: {
      "naver-site-verification": naverSiteVerification,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head />
      <body>
        {adsenseApproved && adsenseClient ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        ) : null}
        {gaId ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag("js", new Date());
                gtag("config", "${gaId}");
              `}
            </Script>
          </>
        ) : null}
        {clarityEnabled && process.env.NEXT_PUBLIC_CLARITY_ID ? (
          <Script
            src={`https://www.clarity.ms/tag/${process.env.NEXT_PUBLIC_CLARITY_ID}`}
            strategy="lazyOnload"
          />
        ) : null}
        <div className="flex min-h-screen flex-col bg-surface">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <Suspense>
            <GaPageView />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
