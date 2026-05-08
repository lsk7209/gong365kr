# Status | 마지막: 2026-05-09
## 현재 작업
generate-meta, AdSense, 기업마당 sync 안정화 배포 검증 중.
## 최근 변경 (최근 5개만)
- 05-09: Bizinfo slug 충돌 방지를 위해 공고 ID를 slug 끝에 포함
- 05-09: 기업마당 API·상세·PDF fetch에 5xx/일시적 실패 3회 재시도 적용
- 05-08: AdSense publisher 기본값 적용 및 `public/ads.txt` 추가
- 05-08: Turso 원격 schema push, Bizinfo sync 1건 실호출, Vercel env 등록
- 05-08: Vercel PDF 런타임 500 방지를 위해 pdf-parse 지연 로딩 및 canvas 고정
## TODO
- [ ] `CRON_ENABLED=true` 전환 전 GitHub Actions sync 재검증
- [ ] Gemini 구조화/임베딩 단계 구현
- [ ] 행사정보 API 대응 기능 설계
## 결정사항
- Bizinfo sync: 키 누락 시 외부 호출 전 503 반환
- refresh-status: 외부 API 없이 DB 날짜 기준으로 status 갱신
- generate-meta: PDF 텍스트 추출 성공 시 `program_meta.updatedAt` 기록
- PDF 후보: HWPX 등 비PDF를 건너뛰고 성공한 PDF만 저장
- Vercel 서버리스: `pdf-parse`는 인증 후 동적 import, canvas는 직접 의존성 고정
- 외부 호출: fetch 실패·5xx만 3회 재시도, 4xx는 즉시 반환
- Slug: 제목 기반 slug 충돌 방지를 위해 `pblancId`를 suffix로 포함
- 배포: 수시 배포하지 않고 큰 작업 단위가 끝날 때만 진행
## 주의
- 행사정보 API 키는 받았지만 현재 코드에 대응 env/기능이 없어 미적용
- GitHub Actions sync 실패 원인은 기업마당 API `ECONNRESET`이었고 재시도 로직으로 보강됨
