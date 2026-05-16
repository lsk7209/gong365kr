# Status | 마지막: 2026-05-16
## 현재 작업
- 블로그 글 300개 생성 진행 중 (현재 26개 완료: batch-01 10개 + batch-02 16개)
- batch-03 생성 준비 중

## 최근 변경 (최근 5개)
- 05-16: batch-02.ts 생성·검증·커밋·푸시·배포 확인 (16개 글) — 총 26개
- 05-16: posts.ts 배치 구조로 전환 (batch-01.ts 생성, posts.ts aggregator화)
- 05-16: 블로그 글 미검증 수치 전량 제거 (Post 1·2·4·6·9) → 품질 90점 목표
- 05-16: 블로그 글 1,2,4,6,7,8번 고품질 콘텐츠로 업그레이드 (비교표·체크리스트·FAQ 포함)
- 05-16: 블로그 메뉴 + 창업 관련 글 10개 추가 (lib/blog, app/blog)

## 완료된 최적화
- Phase 2 SEO: OG/BreadcrumbList/JSON-LD 전 페이지 완료
- Phase 3 속도: content-visibility, Clarity, next.config 완료
- Phase 4 컨텐츠: RelatedEventList, summaryShort 개선 완료
- Phase 5 AdSense: adsense-unit.tsx 준비 완료 (승인 대기)

## TODO
- [x] batch-02.ts 커밋
- [x] batch-02.ts 푸시
- [x] Vercel 배포 확인
- [ ] batch-03 ~ batch-10 순차 생성 (목표: 총 300개, 현재 26개)
  - 다음 주제: 부산 창업 지원사업, 법인 설립 가이드, 창업 팀 구성, 창업 초기 세금, 창업 마케팅, 재도전 지원사업, 소셜벤처, 수출 바우처, 음식점 창업, AI·딥테크 등
- [ ] AdSense 승인 후 NEXT_PUBLIC_ADSENSE_APPROVED=true 설정 → 광고 단위 배치
- [ ] GA4 콘솔에서 program_apply_clicked·event_apply_clicked 전환 이벤트 표시 (수동)
- [ ] GSC 2-4주 후 재분석 → CTR 낮은 페이지 개선

## 결정사항
- meta_priority: naver → description 80자 적용 (B-03)
- 블로그 배치 구조: batch-01(10개), batch-02~10(30개씩) → posts.ts에서 합산
- 품질 기준: 미검증 통계 수치 금지, 공식 프로그램 금액만 사용

## 주의
- batch-02.ts 배포 확인 URL: /blog/yebichangupin-paeikiji-wanjeon-gaideu-2026
- 확인된 공식 금액: 예비창업패키지 최대 1억, 초기창업패키지 최대 1억(딥테크 1.5억), 창업도약패키지 최대 2억, TIPS 최대 5억 R&D, 청년창업사관학교 최대 1억
- Vercel 배포: git push origin main만 사용 (vercel CLI 금지)
