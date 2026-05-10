# Status | 마지막: 2026-05-11
## 현재 작업
- site-optimizer T2 전체 적용 완료 → Vercel 배포 트리거됨
- G-01(Microsoft Clarity) 선택 항목만 미적용 (Clarity ID 필요)

## 최근 변경 (최근 5개)
- 05-11: site-optimizer T2 일괄 적용 (A-01/A-02/B-01/B-02/B-03/C-02)
- 05-11: GA4 추적 인프라 + Trackable 컴포넌트 적용
- 05-11: `/api/cron/submit-search` 검색엔진 자동 색인 제출 파이프라인
- 05-11: `app/api/cron/sync` `sourceInfo` 공통 포맷 전환
- 05-11: `lib/search-submit.ts` SearchSubmitSourceInfo 공통 빌더 추가

## TODO
- [ ] Vercel 배포 확인 후 `/sitemap.xml`, `/feed.xml`, `robots.txt` 점검
- [ ] `/api/cron/submit-search` 수동 호출 → 응답 JSON 확인
- [ ] GA4/GSC/IndexNow 환경변수 존재 여부 검증
- [ ] G-01: Microsoft Clarity 설치 (Clarity 프로젝트 ID 확보 후)
- [ ] 상세 페이지 디자인 리뷰 (plan/programs/events/regions)

## 결정사항
- meta_priority: naver → description 80자 적용 (B-03)
- OG 이미지 PNG 직접 생성 (@napi-rs/canvas), SVG 파일은 유지
- FAQPage JSON-LD Article에서 독립 분리 → 구글 리치결과 인식

## 주의
- `GSC_SERVICE_ACCOUNT_JSON` 또는 `GSC_CLIENT_EMAIL`/`GSC_PRIVATE_KEY` 없으면 인덱싱 제출 실패
- `INDEXNOW_KEY` 없으면 네이버 제출 스킵
- llms.txt "0건 샘플" → 크론 sync 실행 후 자동 해소 (T1)
