# Status | 마지막: 2026-05-09
## 현재 작업
generate-meta, AdSense, 기업마당 sync 안정화 배포 검증 중.
## 최근 변경 (최근 5개만)
- 05-09: 기업마당 Vercel 10건 호출도 500 반환해 GitHub Actions sync를 최신 1건 호출로 축소
- 05-09: Vercel→기업마당 ECONNRESET 대응을 위해 명시적 User-Agent/Accept-Language 추가
- 05-09: Vercel→기업마당 ECONNRESET 완화를 위해 sync 기본 배치와 workflow 호출을 10건으로 제한
- 05-09: Bizinfo slug 충돌 방지를 위해 공고 ID를 slug 끝에 포함
- 05-09: 기업마당 API·상세·PDF fetch에 5xx/일시적 실패 3회 재시도 적용
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
- Sync batch: 기업마당 API 안정성을 위해 기본 `pageUnit=10`
- GitHub Actions sync: Vercel→기업마당 500 회피를 위해 `pageUnit=1`부터 운영 검증
- Bizinfo headers: Vercel 서버리스 호출 차단 완화를 위해 User-Agent/Accept-Language 명시
- 배포: 수시 배포하지 않고 큰 작업 단위가 끝날 때만 진행
## 주의
- 행사정보 API 키는 받았지만 현재 코드에 대응 env/기능이 없어 미적용
- GitHub Actions sync 실패 원인은 기업마당 API `ECONNRESET`이었고 재시도 로직으로 보강됨
