# Status | 마지막: 2026-05-10
## 현재 작업
네이버 RSS 형식 오류 수정 완료. 다음 작업은 Gemini 구조화/임베딩 단계 구현.
## 최근 변경 (최근 5개만)
- 05-10: 검색엔진 제출 URL을 `SEARCH_SUBMIT_SITE_URL`로 분리
- 05-10: 네이버 RSS 인식을 위해 BOM 제거와 기본 RSS item 추가
- 05-10: `/feed.xml` RSS와 Search Console/IndexNow 제출 스크립트 추가
- 05-10: GSC 서비스 계정 `id-ai-179@cursorai-451704.iam.gserviceaccount.com` 소유자 추가 완료 확인
- 05-10: GA4 측정 ID `G-5FJ0PMBPHJ` 전역 태그 추가
## TODO
- [x] 홈/마감/지역 페이지를 Turso 실제 `programs` 데이터로 연결
- [x] Google/Naver 사이트 소유확인 메타 태그 추가
- [x] GA4 태그 추가
- [x] `/feed.xml` RSS와 검색엔진 제출 스크립트 추가
- [x] 네이버 RSS 형식 오류 수정
- [ ] Gemini 구조화/임베딩 단계 구현
- [ ] 행사정보 API 대응 기능 설계
## 결정사항
- 검색엔진 제출: Google은 GSC Sitemaps API, Naver/Bing 계열은 IndexNow POST 사용
- 기본 사이트 URL: `https://gong365.kr`
- GSC: 서비스 계정 소유자 권한 추가 완료 상태로 이후 GSC/Indexing API 자동화 가능
- GA4: `NEXT_PUBLIC_GA_ID` 우선, 미설정 시 제공받은 `G-5FJ0PMBPHJ` 사용
- 검색엔진 인증: env 값 우선, 미설정 시 제공받은 인증값을 기본값으로 사용
- 페이지 데이터 조회: DB env 누락/조회 실패 시 렌더 실패 대신 빈 상태 표시
- 지역 필터: `programs_regions` 매핑 전까지 공고명/요약/기관 텍스트 키워드 기반으로 연결
- 공고 목록: 홈은 마감 임박 3건, 월별/지역 상세는 최대 50건 노출
- 조회 함수: 쓰기 repository와 분리해 `query-repository.ts`에 배치
## 주의
- 로컬에는 `.env.local`이 없어 브라우저 검증 시 빈 상태가 정상 표시됨
- AdSense 스크립트의 `data-nscript` 경고는 기존 레이아웃 경고로 남아 있음
