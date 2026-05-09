# Status | 마지막: 2026-05-10
## 현재 작업
홈/마감/지역 페이지 Turso `programs` 데이터 연결 완료. 다음 작업은 Gemini 구조화/임베딩 단계 구현.
## 최근 변경 (최근 5개만)
- 05-10: 홈/마감/지역 페이지를 목업 대신 `programs` 조회 데이터로 연결
- 05-10: 공고 카드/빈 상태/지역 상수/페이지 데이터 래퍼 추가
- 05-09: GitHub Actions variable `CRON_ENABLED=true` 전환
- 05-09: GitHub Actions runner 직접 Turso upsert 스크립트 추가
- 05-09: 기업마당 Vercel 호출 실패 회피를 위해 Actions sync 운영 경로 조정
## TODO
- [x] 홈/마감/지역 페이지를 Turso 실제 `programs` 데이터로 연결
- [ ] Gemini 구조화/임베딩 단계 구현
- [ ] 행사정보 API 대응 기능 설계
## 결정사항
- 페이지 데이터 조회: DB env 누락/조회 실패 시 렌더 실패 대신 빈 상태 표시
- 지역 필터: `programs_regions` 매핑 전까지 공고명/요약/기관 텍스트 키워드 기반으로 연결
- 공고 목록: 홈은 마감 임박 3건, 월별/지역 상세는 최대 50건 노출
- 조회 함수: 쓰기 repository와 분리해 `query-repository.ts`에 배치
## 주의
- 로컬에는 `.env.local`이 없어 브라우저 검증 시 빈 상태가 정상 표시됨
- AdSense 스크립트의 `data-nscript` 경고는 기존 레이아웃 경고로 남아 있음
