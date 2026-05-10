# Status | 마지막: 2026-05-11
## 현재 작업
- 세션 종료 반영: 크론 응답 sourceInfo 공통화 작업은 여기까지 완료
- 다음 세션에서는 운영 검증(`/sitemap.xml`, `/feed.xml`, `robots.txt`, `submit-search` 응답 로그)로 이어감

## 최근 변경 (최근 5개)
- 05-11: `/api/cron/submit-search` 응답에 `sourceInfo` 공통 빌더 적용
- 05-11: `app/api/cron/sync` `sourceInfo`를 공통 포맷으로 전환
- 05-11: `app/api/cron/sync-events` `sourceInfo`를 공통 포맷으로 전환
- 05-11: `lib/search-submit.ts` `SearchSubmitSourceInfo` + `buildSearchSubmitSourceInfo` 추가
- 05-11: `lib/search-submit.ts` `getSearchSubmitNextRetryAt` 추가

## TODO
- [ ] 배포 후 실제 `/sitemap.xml`, `/feed.xml`, `robots.txt`, `submit-search` 응답 로그 점검
- [ ] GA4/GSC/IndexNow 인증 값 존재 여부 검증 (service account, INDEXNOW_KEY)
- [ ] 계획/메뉴 상세 페이지 콘텐츠 가독성/상태 배지/CTA 배치 최종 디자인 리뷰

## 결정사항
- 오픈/마감 섹션 정책은 삭제 없이 보관 노출 유지로 유지
- WordPress 플러그인 의존 최적화는 현재 Next.js 스택에서는 코드 경로 우선으로 접근

## 주의
- `.env`에 `GSC_SERVICE_ACCOUNT_JSON` 또는 `GSC_CLIENT_EMAIL`/`GSC_PRIVATE_KEY`가 없으면 인덱싱 자동 제출이 실패할 수 있음
- `INDEXNOW_KEY` 없으면 네이버 제안 제출이 자동 스킵됨

## 실수 기록
- 없음
