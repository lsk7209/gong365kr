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
pnpm build
```

## 주요 환경변수

필요한 값은 `.env.example`을 기준으로 `.env.local`에 설정합니다. 현재 Sprint 1 범위에서는 외부 API 실호출과 DB push를 실행하지 않습니다.
