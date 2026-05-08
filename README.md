# gong365kr

창업머니맵은 예비창업자와 초기 창업자가 정부·지자체 지원사업을 한 화면에서 탐색하고, 자격 적합도를 빠르게 판단할 수 있도록 만드는 Next.js 기반 서비스입니다.

## 개발

```bash
pnpm install
pnpm dev
```

## 검증

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

## 주요 환경변수

필요한 값은 `.env.example`을 기준으로 `.env.local`에 설정합니다. 현재 Sprint 1 범위에서는 외부 API 실호출과 DB push를 실행하지 않습니다.

## 운영 Cron

Vercel Cron 대신 GitHub Actions가 배포된 API 라우트를 호출합니다.

- 30분마다: `/api/cron/sync`
- 매일 06:00 KST: `/api/cron/refresh-status`

GitHub Secrets:

- `VERCEL_BASE`: 배포된 사이트 origin, 예: `https://www.gong365.kr`
- `CRON_SECRET`: API 라우트의 Bearer 인증 토큰
- `VERCEL_AUTOMATION_BYPASS_SECRET`: Vercel Deployment Protection 우회 토큰

GitHub Variables:

- `CRON_ENABLED`: `true`일 때 예약 cron 실행. DB/API 키 준비 전에는 `false` 유지
