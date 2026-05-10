import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import { getSiteName, getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();
const siteName = getSiteName();
const defaultAdsensePublisherId = "ca-pub-3050601904412736";
const defaultGaId = "G-5FJ0PMBPHJ";
const defaultGoogleSiteVerification = "KzXCRzOdWolZAjS1EDgmX9PKMKklb2ILHO0vIv0fRGA";
const defaultNaverSiteVerification = "66f0f3f9b53c2c92af321f493745658e8843db7f";
const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_PUB_ID ?? process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? defaultAdsensePublisherId;
const gaId = process.env.NEXT_PUBLIC_GA_ID ?? defaultGaId;
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION ?? defaultGoogleSiteVerification;
const naverSiteVerification = process.env.NAVER_VERIFICATION ?? defaultNaverSiteVerification;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | 창업지원사업 공고 검색`,
    template: `%s | ${siteName}`
  },
  description:
    "창업지원사업, 정책자금, 지역별 창업지원금과 이벤트 정보를 한곳에서 정리하고 원문 공고까지 바로 확인할 수 있는 정보 서비스입니다.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: `${siteName} | 창업지원사업 공고 검색`,
    description: "창업자에게 필요한 지원사업과 정책자금 정보를 빠르게 정리해 비교하고 확인할 수 있는 가이드",
    url: siteUrl,
    siteName,
    locale: "ko_KR",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
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
      <head>
        {adsenseClient ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body>
        {gaId ? (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
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
        <div className="flex min-h-screen flex-col bg-surface">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
