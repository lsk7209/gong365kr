# Status | 마지막: 2026-05-10
## 현재 작업
기업마당 행사정보 API 저장 기능 구현, Turso 적용, 1건 저장 검증 완료.
## 최근 변경 (최근 5개만)
- 05-10: 행사정보 `events` 테이블과 `sync-events` 크론 추가
- 05-10: Gemini로 공고문 자격조건 구조화와 유사도 임베딩 저장 추가
- 05-10: 검색엔진 제출 URL을 `SEARCH_SUBMIT_SITE_URL`로 분리
- 05-10: 네이버 RSS 인식을 위해 BOM 제거와 기본 RSS item 추가
- 05-10: `/feed.xml` RSS와 Search Console/IndexNow 제출 스크립트 추가
## TODO
- [x] 홈 마감/지역 페이지를 Turso 실제 `programs` 데이터로 연결
- [x] Google/Naver 사이트 소유확인 메타 태그 추가
- [x] GA4 태그 추가
- [x] `/feed.xml` RSS와 검색엔진 제출 스크립트 추가
- [x] 네이버 RSS 형식 오류 수정
- [x] Gemini 구조화/임베딩 단계 구현
- [x] 행사정보 API 저장 기능 구현
- [ ] 행사정보 목록/상세 페이지 노출
## 결정사항
- 행사정보: 지원사업 `programs`와 분리해 `events` 테이블에 저장
- 행사 동기화: 기업마당 `bizinfoEventApi.do` 공식 REST JSON 사용
- 행사 크론: GitHub Actions `sync-events`, 매시 15분 실행 조건 추가
- 기본 사이트 URL: `https://gong365.kr`
## 주의
- Vercel 런타임에 `GEMINI_API_KEY`가 없으면 `/api/cron/generate-meta`는 503 반환
- `.env.local`은 Vercel env pull로 생성된 로컬 비공개 파일이며 git 제외됨
- AdSense 스크립트의 `data-nscript` 경고는 기존 레이아웃 경고로 남아 있음
