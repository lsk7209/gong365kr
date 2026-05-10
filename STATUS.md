# Status | 마지막: 2026-05-10
## 현재 작업
지원사업 목록/상세 페이지 구현 및 정적 검증 완료.
## 최근 변경 (최근 5개만)
- 05-10: `/programs`, `/programs/[slug]`, 지원사업 sitemap URL 추가
- 05-10: `/events` 검색어 `q` 필터 추가
- 05-10: `/events` 지역/유형 쿼리 필터와 facet 카운트 추가
- 05-10: `/events`, `/events/[slug]`, 홈 행사 섹션과 RSS/사이트맵 반영 추가
- 05-10: 행사정보 `events` 테이블과 `sync-events` 크론 추가
## TODO
- [x] 홈 마감/지역 페이지를 Turso 실제 `programs` 데이터로 연결
- [x] Google/Naver 사이트 소유확인 메타 태그 추가
- [x] GA4 태그 추가
- [x] `/feed.xml` RSS와 검색엔진 제출 스크립트 추가
- [x] 네이버 RSS 형식 오류 수정
- [x] Gemini 구조화/임베딩 단계 구현
- [x] 행사정보 API 저장 기능 구현
- [x] 행사정보 목록/상세 페이지 노출
- [x] 행사정보 지역/유형 필터 추가
- [x] 행사정보 검색어 필터 추가
- [x] 지원사업 목록/상세 페이지 정식 노출
- [ ] 지원사업 지역/분야/검색 필터 고도화
## 결정사항
- 지원사업 목록: `/programs?q=...&category=...`
- 지원사업 상세: `/programs/[slug]`, 원문 공고와 자격 확인 CTA 제공
- RSS 기존 `/programs/[slug]` 링크는 실제 상세 페이지로 연결
- 기본 사이트 URL: `https://gong365.kr`
## 주의
- Vercel 런타임에 `GEMINI_API_KEY`가 없으면 `/api/cron/generate-meta`는 503 반환
- Vercel sensitive env는 `env pull` 시 로컬에 빈 값으로 내려올 수 있음
