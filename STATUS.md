# Status | 마지막: 2026-05-08
## 현재 작업
GitHub Actions cron 자동화 구현 완료, 다음은 실제 키 기반 sync 검증 또는 PDF 파싱
## 최근 변경 (최근 5개만)
- 05-08: GitHub Actions cron workflow 추가
- 05-08: `/api/cron/refresh-status` 추가, 공고 상태 자동 갱신 로직 구현
- 05-08: 상태 계산·refresh route 테스트 추가
- 05-08: `/api/cron/sync` CRON_SECRET 검증, Bizinfo fetch/normalize/upsert 구조 추가
- 05-08: Bizinfo 파서·sync route 테스트 5개 추가
## TODO
- [x] Next.js 15 기반 골격 검증
- [ ] Turso/공공데이터/Gemini 키 확보 후 실호출 검증
- [x] Bizinfo sync 기능 구현
- [x] refresh-status 기능 구현
- [x] GitHub Actions cron 검증
## 결정사항
- 첫 범위: Sprint 1 기반 구축부터 진행
- 키 처리: 키 없이 골격과 검증 스크립트 우선
- Bizinfo sync: 키 누락 시 외부 호출 전 503 반환
- refresh-status: 외부 API 없이 DB 날짜 기준으로 status 갱신
- 운영 cron: GitHub Actions에서 Vercel API 라우트 호출
## 주의
- 자동 본문 생성·실 API 호출·DB push는 Sprint 1 범위에서 제외됨
