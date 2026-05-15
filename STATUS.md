# Status | 마지막: 2026-05-15
## 현재 작업
- Phase 1~5 최적화 완료, Vercel 배포 대기 중

## 최근 변경 (최근 5개)
- 05-15: Phase 1~5 종합 최적화 (페르소나/SEO/성능/컨텐츠/AdSense)
- 05-15: events/programs 상세 페이지 JSX/JS 문법 오류 수정 (EUC-KR 깨진 한글 → 정상화)
- 05-15: llms.txt/llms-full.txt/ai-index.json 동적 route 전환 (DB 실시간 반영)
- 05-15: vercel.json cron 설정 추가 (sync 6h, submit-search 03:00)
- 05-15: cron-auth x-vercel-cron 우선 허용 (CRON_SECRET 없어도 Vercel cron 작동)

## TODO
- [ ] 배포 후 `/llms.txt` DB 건수 반영 확인
- [ ] `/api/cron/submit-search` 수동 호출 → 네이버/Google 제출 상태 확인
- [ ] G-01: Microsoft Clarity 설치 (Clarity 프로젝트 ID 확보 후)
- [x] Phase 6: GSC 분석 완료 (이슈 0, 노출 15페이지, 클릭 0 — 신규 사이트 정상)
- [ ] Phase 7: GA4 콘솔에서 open_official·open_event 전환 이벤트 표시 (수동)
- [ ] AdSense 승인 후 NEXT_PUBLIC_ADSENSE_APPROVED=true 설정 → 광고 단위 배치
- [ ] 상세 페이지 디자인 리뷰 (plan/programs/events/regions)

## 결정사항
- meta_priority: naver → description 80자 적용 (B-03)
- llms 파일: 정적→동적 route 전환 (public/ 파일 삭제, app/ route 생성)
- cron-auth: Vercel 내부 cron은 CRON_SECRET 없이 x-vercel-cron 헤더로 허용

## 주의
- Vercel env 추가 후 redeploy 필요 (env만 추가하면 자동 재배포 안 됨)
- vercel.json cron은 Vercel Pro 플랜 이상 필요
