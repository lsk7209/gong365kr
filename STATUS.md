# Status | 마지막: 2026-05-15
## 현재 작업
- 배포 안정화 완료 (● Ready)

## 최근 변경 (최근 5개)
- 05-15: GaPageView Suspense 래핑 (useSearchParams prerender 오류 수정)
- 05-15: isEventClosedCondition/isProgramClosedCondition → sql 템플릿으로 변경 (SQL|undefined→SQL)
- 05-15: sitemap.ts getLatestDate string|Date 타입 지원
- 05-15: BIZINFO_API_KEY=BZNQ06 Vercel 등록
- 05-15: Clarity 설치, GA4 전환 이벤트(program_apply_clicked/event_apply_clicked)

## TODO
- [ ] Vercel env에 CRON_SECRET 설정 → 수동 cron 호출 가능 (선택사항, scheduled 자동 실행은 정상)
- [ ] GA4 콘솔에서 program_apply_clicked·event_apply_clicked 전환 이벤트 표시 (수동)
- [ ] AdSense 승인 후 NEXT_PUBLIC_ADSENSE_APPROVED=true 설정 → 광고 단위 배치
- [ ] BIZINFO_API_KEY 발급 → sync/sync-events cron 실제 데이터 수집

## 결정사항
- meta_priority: naver → description 80자 적용 (B-03)
- llms 파일: 정적→동적 route 전환 (DB 실시간 반영)
- cron-auth: Vercel 내부 cron은 x-vercel-cron 헤더로 허용, 외부 수동 호출은 CRON_SECRET 필요

## 주의
- Vercel env 추가 후 redeploy 필요 (env만 추가하면 자동 재배포 안 됨)
- vercel.json cron은 Vercel Pro 플랜 이상 필요
- CRON_SECRET 없으면 외부 curl 수동 호출 불가 (scheduled 자동 실행에는 영향 없음)
