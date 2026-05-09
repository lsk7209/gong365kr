# Status | 마지막: 2026-05-10
## 현재 작업
Gemini 구조화/임베딩 파이프라인 구현 및 검증 완료.
## 최근 변경 (최근 5개만)
- 05-10: Gemini로 공고문 자격조건 구조화와 유사도 임베딩 저장 추가
- 05-10: 검색엔진 제출 URL을 `SEARCH_SUBMIT_SITE_URL`로 분리
- 05-10: 네이버 RSS 인식을 위해 BOM 제거와 기본 RSS item 추가
- 05-10: `/feed.xml` RSS와 Search Console/IndexNow 제출 스크립트 추가
- 05-10: GA4 측정 ID `G-5FJ0PMBPHJ` 전역 태그 추가
## TODO
- [x] 홈 마감/지역 페이지를 Turso 실제 `programs` 데이터로 연결
- [x] Google/Naver 사이트 소유확인 메타 태그 추가
- [x] GA4 태그 추가
- [x] `/feed.xml` RSS와 검색엔진 제출 스크립트 추가
- [x] 네이버 RSS 형식 오류 수정
- [x] Gemini 구조화/임베딩 단계 구현
- [ ] 행사정보 API 저장 기능 설계
## 결정사항
- Gemini: SDK 추가 없이 공식 REST API 사용
- 임베딩: `gemini-embedding-2` 기본값, 저장 시 Float32Array Buffer로 변환
- 생성 메타: `eligibility_structured`, `fitness_axes`, `similarity_embedding`에 저장
- 기본 사이트 URL: `https://gong365.kr`
## 주의
- Vercel 런타임에 `GEMINI_API_KEY`가 없으면 `/api/cron/generate-meta`는 503 반환
- 로컬에는 `.env.local`이 없어 브라우저 검증 시 빈 상태가 정상 표시됨
- AdSense 스크립트의 `data-nscript` 경고는 기존 레이아웃 경고로 남아 있음
