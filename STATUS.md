# Status | 마지막: 2026-05-08
## 현재 작업
Bizinfo sync 1차 구현 완료, 다음은 실제 키 기반 실호출 검증
## 최근 변경 (최근 5개만)
- 05-08: `/api/cron/sync` CRON_SECRET 검증, Bizinfo fetch/normalize/upsert 구조 추가
- 05-08: Bizinfo 파서·sync route 테스트 5개 추가
- 05-08: Next.js 15, Tailwind, Drizzle/Turso 스키마, SEO 기본 파일 구축
- 05-08: CHANGEOP_MONEYMAP_SPEC.md 기반 구현 계획 확정
## TODO
- [x] Next.js 15 기반 골격 검증
- [ ] Turso/공공데이터/Gemini 키 확보 후 실호출 검증
- [x] Bizinfo sync 기능 구현
## 결정사항
- 첫 범위: Sprint 1 기반 구축부터 진행
- 키 처리: 키 없이 골격과 검증 스크립트 우선
- Bizinfo sync: 키 누락 시 외부 호출 전 503 반환
## 주의
- 자동 본문 생성·실 API 호출·DB push는 Sprint 1 범위에서 제외됨
