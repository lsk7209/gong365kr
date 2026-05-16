# Status | 마지막: 2026-05-16
## 현재 작업
- 블로그 글 300개 생성 완료, 검증·배포 확인 완료
- batch-29 10개, batch-30 4개 추가로 목표 300/300 도달

## 최근 변경 (최근 5개만)
- 05-16: 최종 300개 테스트·lint·type-check·build·Vercel 배포·공개 숨김 검증 완료
- 05-16: batch-29, batch-30 추가로 총 300개 예약글 구성
- 05-16: batch-28.ts 추가, 총 286개 예약글로 확장
- 05-16: batch-27.ts 추가, 총 276개 예약글로 확장
- 05-16: SEO/GA4/AdSense·Clarity 게이트 최적화, GSC sitemap·IndexNow 제출 확인

## TODO
- [ ] AdSense 승인 후 env 등록
- [ ] GA4 전환 이벤트 콘솔 확인
- [ ] GSC 2-4주 데이터 축적 후 CTR 낮은 페이지 개선

## 결정사항
- 예약 발행: 2026-05-16 00:00 KST부터 글마다 5시간 간격
- 비공개 예약글: 목록·상세·sitemap·검색 제출에서 제외
- 글 품질 기준: batch-03부터 출처 3개, qualityScore 90 이상, 본문 3500자 이상

## 주의
- 마지막 예약글: 2026-07-17 07:00 KST
- Vercel 배포는 git push origin main만 사용
- .omc/는 로컬 미추적 파일이므로 커밋 제외
