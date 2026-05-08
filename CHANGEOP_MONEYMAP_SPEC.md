# 창업머니맵 (StartupMoneyMap) — Project Specification v1.0

> 창업자를 위한 정부·지자체 지원금 통합 정보 플랫폼
> 공공데이터 + AI 해석 3-layer 프로그래매틱 SEO 사이트

---

## 0. 변경 이력

| Version | Date       | 변경 사항                                       |
|---------|------------|------------------------------------------------|
| 1.0     | 2026-05-08 | 초안. 5-페르소나 검토 합의 결과 반영              |

---

## 1. 프로젝트 개요

### 1.1 미션

창업자가 받을 수 있는 모든 자금(창업지원사업 + 정책자금 융자 + 지자체 보조금)을 한 화면에서 발견하고, "내가 받을 수 있는가"를 즉시 판단할 수 있게 한다.

### 1.2 타겟

- 1차: 예비창업자, 초기창업기업(3년 이내), 청년창업, 여성창업, 재창업자
- 필터링: 단계(예비/초기/성장기) + 자격(나이·성별·지역·업종)을 모든 페이지 공통 필터로

### 1.3 차별화 포지션

기업마당·K-Startup이 raw 공고를 나열하는 데 그치는 반면, 창업머니맵은 다음 4종 derived metrics를 제공한다:

1. **자격 적합도 체크** — 5~7개 질문 기반 인터랙티브 매칭
2. **유사 사업 매칭** — 임베딩 기반, 한 사업 페이지에서 비슷한 3건 추천
3. **작년 대비 변화 시그널** — "예산 30% 증액", "자격 완화", "신규 추가" 자동 라벨
4. **경쟁률·난이도 스코어** (Phase 2) — 합격자 명단 PDF 파싱 기반

### 1.4 비즈니스 모델

- **AdSense Auto Ads** — in-article 1, sidebar 1
- **Affiliate** (Phase 1.5+) — 사업자 대출 비교, 회계 SaaS, 법인설립 대행, 사업자 통장 (자격 적합도 결과 페이지가 핵심 매칭 지점)
- **이메일 시퀀스** (Phase 2) — 적합도 결과 가입자 대상 마감 임박 알림 + affiliate 추천

---

## 2. 기술 스택

| 영역             | 선택                                       |
|------------------|--------------------------------------------|
| 프레임워크       | Next.js 15 App Router                      |
| 호스팅           | Vercel Pro                                 |
| 데이터베이스     | Turso (libSQL) + Drizzle ORM               |
| 자동화           | GitHub Actions cron                        |
| AI 모델          | Gemini 2.0 Flash (구조화) + Gemini Pro (본문 생성·critic) |
| 임베딩           | Gemini text-embedding-004                  |
| PDF 파싱         | pdf-parse                                  |
| 패키지 매니저    | pnpm (monorepo 가능성 열어둠)              |
| 이메일           | Resend (Phase 2)                           |
| 인증             | Auth.js (Google OAuth) — Phase 2          |
| SEO              | next-sitemap, next-seo, IndexNow           |
| 모니터링         | Vercel Analytics + GA4 + GSC API           |

---

## 3. 데이터 소스

### 3.1 기업마당 BizinfoApi (메인 ★)

**Endpoint**

```
GET https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do
```

**Parameters**

| Param      | Required | Note                                          |
|------------|----------|-----------------------------------------------|
| crtfcKey   | ✓        | 공공데이터포털 발급 서비스키                    |
| dataType   | ✓        | "json" (xml도 가능)                           |
| pageIndex  | ✓        | 페이지 번호 (1부터)                            |
| pageUnit   | ✓        | 페이지 크기 (최대 50 권장)                     |
| hashtags   |          | 콤마 구분. 지역·대상·분야 동시 필터              |

**hashtags 가능값**

- 지역: 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기도, 강원도, 충청북도, 충청남도, 전라북도, 전라남도, 경상북도, 경상남도, 제주특별자치도
- 대상: 소상공인, 중소기업, 중견기업, 벤처기업, 창업기업, 예비창업자, 청년, 여성, 농업인, 어업인, 자영업자
- 분야: 금융, 기술, 인력, 수출, 내수, 창업, 경영, 기타

**응답 핵심 필드**

응답 루트키는 `jsonArray` → `item` (배열). 필드명은 RSS 호환과 공식 호환이 혼재하므로 양쪽 모두 처리한다.

| 의미       | 필드명 후보 (양쪽 모두 fallback)                       |
|-----------|---------------------------------------------------------|
| 공고 ID    | `pblancId` \| `seq`  (예: `PBLN_000000000120528`)       |
| 사업명     | `pblancNm` \| `title`                                    |
| 요약       | `bsnsSumryCn` \| `description`                            |
| 상세 URL   | `pblancUrl` \| `link`                                     |
| 소관기관   | `jrsdInsttNm` \| `author`                                 |
| 수행기관   | `excInsttNm`                                             |
| 분류       | `pldirSportRealmLclasCodeNm` \| `lcategory`               |
| 등록일     | `creatPnttm` \| `pubDate`                                 |
| 신청기간   | `reqstBeginEndDe` \| `reqstDt` (예: "2026-04-28 ~ 2026-05-22") |
| 지원대상   | `trgetNm`                                                |
| 해시태그   | `hashTags`                                               |

**상세 페이지 URL 패턴**

```
https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId={pblancId}
```

**미확정**: `bsnsSumryCn` 본문 충실도. 100~300자 짧은 요약일 가능성이 높음 → 상세 PDF 파싱 파이프라인이 사실상 필수.

### 3.2 K-Startup OpenAPI (보조 ★)

**Endpoint**: 공공데이터포털 데이터셋 ID `15125364`

**제공 서비스**

- 사업소개, 사업공고 조회
- 통합공고 (다른 부처 사업 포함)
- 창업관련 통계보고서 — 업력별·업종별·성별·연령별 창업기업 수
- 등록센터 목록
- 콘텐츠 (선정사례, 영상, 가이드)

**활용**: 기업마당과 dedup 후 더 풍부한 쪽 채택. 창업진흥원 직접 운영 사업은 K-Startup이 디테일 우위. 통계보고서는 derived metrics(경쟁률 추정 모집단)에 활용.

### 3.3 보조 소스 (Phase 1 후반)

- **소상공인 정책자금** — `https://ols.semas.or.kr/` (별도 API 검증 필요)
- **중진공 정책자금** — `https://www.kosmes.or.kr/` (4조 643억원 융자, 6개 카테고리)
- **중소벤처기업부 사업공고** — 데이터셋 `15113191` (중복 가능, dedup용 reference)

### 3.4 PDF 파싱 파이프라인

기업마당 응답의 `bsnsSumryCn`이 짧을 가능성에 대비해 상세 페이지 PDF를 다운로드 → 텍스트 추출 → Gemini로 구조화한다.

```ts
// pseudocode
const detailHtml = await fetch(pblancUrl).then(r => r.text());
const pdfUrls = extractPdfLinks(detailHtml);
for (const url of pdfUrls) {
  const buffer = await fetch(url).then(r => r.arrayBuffer());
  const text = await pdfParse(Buffer.from(buffer)).text;
  // → Gemini Flash로 자격·금액·절차 구조화
}
```

---

## 4. 데이터베이스 스키마 (Drizzle / Turso)

### 4.1 핵심 테이블

```ts
// programs — 사업 마스터
export const programs = sqliteTable("programs", {
  id:                 integer("id").primaryKey({ autoIncrement: true }),
  pblancId:           text("pblanc_id").unique().notNull(),
  source:             text("source", { enum: ["bizinfo", "kstartup", "semas", "kosmes"] }).notNull(),
  slug:               text("slug").unique().notNull(),
  title:              text("title").notNull(),
  summaryShort:       text("summary_short"),
  agency:             text("agency"),         // 소관기관
  executor:           text("executor"),       // 수행기관
  categoryCode:       text("category_code"),  // 창업/금융/기술 등
  applicationStart:   integer("application_start", { mode: "timestamp" }),
  applicationEnd:     integer("application_end", { mode: "timestamp" }),
  status:             text("status", { enum: ["upcoming", "active", "closed"] }).notNull(),
  rawUrl:             text("raw_url").notNull(),
  detailPdfUrl:       text("detail_pdf_url"),
  rawJson:            text("raw_json"),       // 원본 JSON 백업
  lastSyncedAt:       integer("last_synced_at", { mode: "timestamp" }).notNull(),
  createdAt:          integer("created_at", { mode: "timestamp" }).notNull(),
});

// program_meta — derived metrics
export const programMeta = sqliteTable("program_meta", {
  programId:            integer("program_id").primaryKey().references(() => programs.id, { onDelete: "cascade" }),
  eligibilityStructured: text("eligibility_structured"), // JSON: {ageMax, businessAgeMax, regions[], industries[], gender, ...}
  similarityEmbedding:   blob("similarity_embedding"),    // Float32Array binary
  fitnessAxes:           text("fitness_axes"),            // JSON: {axisName: weight}
  lastYearDiff:          text("last_year_diff"),          // JSON: {budgetDelta, eligibilityDelta, isNew, ...}
  competitionScore:      real("competition_score"),       // Phase 2
  difficultyScore:       integer("difficulty_score"),     // 1-5, Phase 2
  updatedAt:             integer("updated_at", { mode: "timestamp" }).notNull(),
});

// program_content — AI 생성 본문
export const programContent = sqliteTable("program_content", {
  programId:        integer("program_id").primaryKey().references(() => programs.id, { onDelete: "cascade" }),
  summaryLong:      text("summary_long"),           // AI 해석 메인 본문
  whoShouldApply:   text("who_should_apply"),       // "이 사업이 맞는 사람"
  cautions:         text("cautions"),               // "주의사항"
  howToApply:       text("how_to_apply"),           // 신청 절차 정리
  faq:              text("faq"),                    // JSON [{q, a}]
  criticScore:      integer("critic_score"),        // 0-100, Gemini Pro critic 결과
  criticReport:     text("critic_report"),         // 위반 항목 상세
  publishedStatus:  text("published_status", { enum: ["draft", "review", "published", "rejected"] }).notNull(),
  lastGeneratedAt:  integer("last_generated_at", { mode: "timestamp" }),
});

// 분류 마스터
export const regions = sqliteTable("regions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),  // "seoul", "busan", ...
  name: text("name").notNull(),
});

export const industries = sqliteTable("industries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
});

export const targets = sqliteTable("targets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").unique().notNull(),  // "예비창업자", "청년", ...
  name: text("name").notNull(),
});

// m:n 매핑
export const programsRegions = sqliteTable("programs_regions", {
  programId: integer("program_id").notNull().references(() => programs.id, { onDelete: "cascade" }),
  regionId:  integer("region_id").notNull().references(() => regions.id, { onDelete: "cascade" }),
}, (t) => ({ pk: primaryKey({ columns: [t.programId, t.regionId] }) }));

export const programsIndustries = sqliteTable("programs_industries", { /* 동일 */ });
export const programsTargets    = sqliteTable("programs_targets",    { /* 동일 */ });

// 적합도 체크 / 회원가입 (Phase 2)
export const users = sqliteTable("users", { /* Auth.js 표준 */ });
export const fitnessProfiles = sqliteTable("fitness_profiles", {
  userId:        text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  age:           integer("age"),
  gender:        text("gender"),
  region:        text("region"),
  industry:      text("industry"),
  businessStage: text("business_stage"),
  businessYears: integer("business_years"),
  // ...
  createdAt:     integer("created_at", { mode: "timestamp" }).notNull(),
});

export const emailSubscriptions = sqliteTable("email_subscriptions", { /* Phase 2 */ });
```

### 4.2 인덱스

```sql
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_application_end ON programs(application_end);
CREATE INDEX idx_programs_source ON programs(source);
CREATE INDEX idx_programs_slug ON programs(slug);
```

### 4.3 슬러그 생성 규칙

```
{categoryCode}-{kebab-case-of-title}-{year}
예: changup-yebicheangup-pakeji-2026
```

충돌 시 `-2`, `-3` 접미사. 슬러그는 한 번 생성되면 변경 금지(canonical 안정성).

---

## 5. 라우팅 구조 (App Router)

```
app/
├── page.tsx                                      홈 (메인 큐레이션)
├── programs/
│   └── [slug]/
│       └── page.tsx                              사업 상세 (메인 pSEO)
├── regions/
│   ├── page.tsx                                  지역 목록
│   ├── [region]/
│   │   ├── page.tsx                              지역별
│   │   └── [industry]/
│   │       └── page.tsx                          지역×업종 매트릭스
├── categories/
│   ├── page.tsx                                  타겟 목록
│   └── [target]/
│       └── page.tsx                              청년/여성/재창업/예비창업/소상공인
├── deadline/
│   └── [year]/
│       └── [month]/
│           └── page.tsx                          월별 마감 (예: /deadline/2026/06)
├── compare/
│   └── [pair]/
│       └── page.tsx                              비교 (예: /compare/yebicheangup-vs-cheongnyeon-sagwan)
├── check/
│   ├── page.tsx                                  적합도 체크 입력
│   └── result/
│       └── page.tsx                              결과 (비로그인 일부, 가입 후 전체)
├── guides/
│   └── [topic]/
│       └── page.tsx                              가이드/체크리스트/템플릿
├── cases/
│   └── [year]/
│       └── page.tsx                              합격사례 분석 (Phase 2)
├── api/
│   ├── cron/
│   │   ├── sync/route.ts                         기업마당 sync
│   │   ├── refresh-status/route.ts               D-day 갱신
│   │   ├── generate-meta/route.ts                derived metrics
│   │   ├── generate-content/route.ts             AI 본문 생성
│   │   └── yearly-diff/route.ts                  주간 작년 대비 분석
│   ├── check/match/route.ts                      적합도 매칭 API
│   └── revalidate/route.ts                       on-demand revalidation
├── sitemap.ts
├── robots.ts
└── layout.tsx
```

### 5.1 동적 라우트 생성 전략

- 사업 상세, 지역×업종, 타겟별, 월별 마감은 모두 `generateStaticParams` + ISR (`revalidate = 3600`)
- 마감된 사업은 `noindex` 메타태그 + sitemap 제외 + 1주일 후 `/archive/[slug]`로 redirect (308)

---

## 6. 페이지 템플릿

### 6.1 사업 상세 (`/programs/[slug]`)

순서대로:

1. **H1** — `{사업명} | 신청자격·지원금액·마감일 ({year})`
2. **자동 정보 박스** — D-day, 지원금액, 분야, 소관기관, 수행기관
3. **자격 매트릭스** (derived) — 시각적 ✓/✗ 표 (나이·업력·지역·업종·성별)
4. **자격 적합도 체크 CTA** — 인라인 위젯
5. **AI 해석 본문** (50~150단어 chunk) — "이 사업이 맞는 사람", "주의사항", "신청 절차"
6. **비슷한 사업 3건** — 임베딩 매칭, internal linking 강화
7. **신청 가이드 체크리스트** — Markdown 체크박스
8. **작년 대비 변화 시그널** — "올해 예산 30% 증액", "자격 완화" 등 자동 라벨
9. **FAQ** (Gemini 생성, 5건 내외)
10. **원공고 canonical 링크 + disclaimer**
11. **AdSense in-article slot**

### 6.2 지역×업종 매트릭스 (`/regions/[region]/[industry]`)

- H1: `{지역} {업종} 창업지원금 모음 | {year}`
- 필터링된 사업 카드 그리드
- 정렬: 마감 임박 / 지원금액 / 신규 등록
- 빈 결과 페이지는 `noindex` + 인근 지역 추천

### 6.3 자격 적합도 체크 (`/check`)

질문 7개:

1. 사업 단계 (예비/초기/3년 이상)
2. 나이대
3. 성별
4. 지역 (시/도)
5. 업종
6. 회사 형태 (법인/개인)
7. 매출 규모 (개략)

→ 결과 페이지 (`/check/result`)
- **비로그인**: 매칭 사업 상위 3건 + "더 보려면 가입" CTA
- **로그인**: 전체 매칭 + 마감 임박 알림 구독

### 6.4 비교 페이지 (`/compare/[pair]`)

- 큐레이션 기반(자동 X), 50개 내외
- 수동 선정 페어: 예비창업패키지 vs 청년창업사관학교, 초기창업패키지 vs 창업도약패키지 등
- 표 형식 비교 + AI 해석 ("어떤 게 본인에게 맞는가")
- 가장 높은 RPM 예상 페이지 그룹

---

## 7. 콘텐츠 생성 파이프라인

### 7.1 5단계 Quality Gate

Scaled Content Abuse 회피 + YMYL 안전성 확보가 목적.

```
1. 데이터 수집
   bizinfo API → raw 저장 (programs)
   ↓
2. 본문 추출
   상세 PDF 다운로드 → pdf-parse → 원시 텍스트
   ↓
3. 구조화 (Gemini Flash)
   eligibility_structured JSON 생성
   {ageMax, businessAgeMax, regions[], industries[], gender, requiredDocuments[], ...}
   임베딩 생성 (text-embedding-004)
   ↓
4. AI 본문 생성 (Gemini Pro)
   summaryLong, whoShouldApply, cautions, howToApply, faq
   각 chunk 50~150단어 (LLM citation rate ↑)
   원공고 인용시 출처 명시 (canonical 링크)
   ↓
5. Critic Mode (Gemini Pro)
   검증 항목:
   - 단정 표현 ("받을 수 있다") → 추정 표현으로 변환
   - 사실 왜곡 (자격·금액·기간 원본 일치)
   - 정책 위반 (광고 유사 표현, 면허 영역 침범)
   - 본문 길이·구조 적정성
   criticScore < 80 → publishedStatus = "rejected" (재생성 큐)
   ↓
6. Dedup
   기존 published 본문과 cosine 유사도
   ≥ 0.85 → reject
   ↓
7. Publish
   publishedStatus = "published"
   IndexNow ping (Naver / Bing 동시)
   sitemap.xml lastmod 갱신
```

### 7.2 본문 자동 수정 정책

- **autofixable: false** — 자동 본문 재작성 금지 (Scaled Content Abuse 회피)
- 구조적 변경 (자격·금액·마감일)만 자동 갱신
- 본문 자체 변경은 critic을 통해 새로 생성하고 human review 큐에 올림 (Phase 1.5)

### 7.3 발행 속도 제한

| 시점         | 일일 publish 상한 |
|--------------|--------------------|
| 런칭 ~ 1주차 | 10건                |
| 2~4주차      | 30건                |
| 1~2개월차    | 50건                |
| 2개월 이후   | 무제한 (큐 소진)   |

7-day dry run 후 publish 시작.

---

## 8. Derived Metrics (4종)

### 8.1 자격 적합도 매칭

`eligibilityStructured` ↔ 사용자 입력 비교. 각 axis별 만족(1) / 불만족(0) / 부분(0.5).

**Axes**

- 나이 매칭 (예: 만 39세 이하)
- 업력 매칭 (예: 3년 이내)
- 지역 매칭
- 업종 매칭
- 성별 매칭
- 회사 형태 매칭
- 매출 매칭

**최종 점수** = Σ(axis × weight) / Σ(weight). 80 이상 = "강력 추천", 60~79 = "검토", 40~59 = "확인 필요", 40 미만 = "비대상".

### 8.2 유사 사업 매칭

- 임베딩: `title + summary_short + eligibility_structured` → text-embedding-004
- 저장: `program_meta.similarityEmbedding` (Float32Array binary)
- 검색: cosine similarity, 상위 3건. 자기 자신 제외, 같은 카테고리 우대 (+0.05 boost)

### 8.3 작년 대비 변화 시그널

매년 1월 / 6월 / 11월 cron 실행. 사업명 정규화(공백·연도 제거) → 작년 동일 사업 매칭 → diff:

```json
{
  "isNew": false,
  "budgetDelta": "+30%",
  "eligibilityDelta": "자격 완화 (만 39세 → 만 49세)",
  "scheduleDelta": "마감 1개월 단축",
  "labels": ["예산 증액", "자격 완화"]
}
```

### 8.4 경쟁률·난이도 (Phase 2)

- K-Startup 합격자 명단 PDF 파싱 → 선정자수 카운트
- 모집 인원 ÷ 신청 추정치(창업기업실태조사 통계로 모집단 추정) → 경쟁률
- 자격 엄격도 (필수서류 수, 자격 axis 수) + 경쟁률 → 난이도 1~5

---

## 9. 크론 / GitHub Actions

### 9.1 스케줄

```yaml
# .github/workflows/cron-sync.yml
name: Bizinfo sync
on:
  schedule:
    - cron: '*/30 * * * *'  # 30분마다 (KST 기준 시차 고려)
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsSL "${{ secrets.VERCEL_BASE }}/api/cron/sync" -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

전체 cron 라인업:

| Job                  | Cron (UTC)        | KST 환산   | 설명                                     |
|----------------------|-------------------|-----------|------------------------------------------|
| sync                 | `*/30 * * * *`    | 30분마다   | 기업마당 delta sync                       |
| refresh-status       | `0 21 * * *`      | 06:00 KST | D-day 갱신, 마감 사업 closed              |
| generate-meta        | `0 22 * * *`      | 07:00 KST | 신규 사업 PDF 파싱·구조화·임베딩           |
| generate-content     | `0 23 * * *`      | 08:00 KST | AI 본문 생성 (큐, 일일 상한)              |
| yearly-diff          | `0 15 * * 1`      | 매주 월 00:00 KST | 작년 대비 분석                |
| sitemap              | `0 22 * * *`      | 07:00 KST | sitemap 재생성, IndexNow ping              |

### 9.2 보안

- 모든 cron endpoint는 `CRON_SECRET` 헤더 검증
- Vercel cron 대신 GitHub Actions 사용 (Vercel Pro 한도 절약)

---

## 10. AdSense + Affiliate

### 10.1 AdSense

- Auto Ads 활성화
- 수동 슬롯: in-article (사업 상세 본문 중간), sidebar (PC만)
- AdSense 정책 준수: 콘텐츠와 명확히 구분되는 라벨, 본문 1/3 지점 이전 광고 금지

### 10.2 AdSense 승인 전략 (Phase 1 런칭)

- 런칭 시 200개 시드 + 가이드·체크리스트 30개 = 230페이지 목표
- 7일 dry run 동안 publish 페이지 50개 이상 확보
- AdSense 신청은 publish 100건 + GSC 색인 80% 시점
- adsense-optimizer skill 활용

### 10.3 Affiliate (Phase 1.5+)

| 카테고리           | 매칭 페이지                                      |
|--------------------|--------------------------------------------------|
| 사업자 대출 비교   | 정책자금 융자 사업, 적합도 결과 (자격 미달인 경우) |
| 회계 SaaS         | 사업 상세 내 in-article, 가이드 체크리스트         |
| 법인설립 대행      | 예비창업자 대상 사업, 가이드                      |
| 사업자 통장        | 신규 사업자, 적합도 결과                         |

---

## 11. 법무·정책 가드레일

### 11.1 단정 표현 금지

```
❌ "이 사업으로 5천만원을 받을 수 있습니다"
✅ "이 사업의 최대 지원금은 5천만원입니다 (자격 충족 시)"
```

### 11.2 모든 사업 상세 페이지 하단 disclaimer

```
※ 본 페이지는 공공데이터를 기반으로 한 정보 안내이며,
실제 신청·자격·금액은 원공고를 반드시 확인하세요.
원공고: [기업마당 / K-Startup 공식 링크]
업데이트: {lastSyncedAt}
```

### 11.3 광고 라벨

AdSense 슬롯 위에 명시적으로 "광고" 라벨. 정부 정보와 혼동 방지.

### 11.4 면허 영역 회피

- 사업계획서 자문 / 직접 작성 X
- 체크리스트·템플릿까지만
- 세무·법무 자문 X — 단순 정보 안내까지만
- AI 본문에 "전문가 상담 권유" 디스클레이머

### 11.5 공공데이터 라이선스

기업마당·K-Startup 데이터는 공공데이터포털 라이선스로 상업 이용 가능. 단 출처 표기 의무 — 모든 사업 상세 페이지에 원공고 canonical 링크 노출.

---

## 12. SEO·AEO·GEO

### 12.1 메타 표준

- title: `{사업명} | 자격·금액·마감일 {year} | 창업머니맵`
- description: 150자 내외 자동 생성
- canonical: 자기 페이지 URL
- og:image: 동적 OG 이미지 (Next.js `ImageResponse`)
- JSON-LD: `GovernmentService` + `FAQPage` (FAQ 있을 시)

### 12.2 sitemap.xml

- next-sitemap 사용
- lastmod 정확히 (Google 권고: ping 엔드포인트 deprecated, lastmod만 권장)
- closed 사업 제외, /archive 별도 sitemap

### 12.3 IndexNow

- Naver, Bing 동시 ping
- publish 시점에 자동 호출

### 12.4 AEO (Answer Engine Optimization)

- 50~150단어 chunk 단위 본문 (LLM citation rate ~2.3x)
- 구조화 콘텐츠 (FAQ, 단계별 절차)
- aeo.js 활용 (universal CLAUDE.md 기준)

### 12.5 GEO (Generative Engine Optimization)

- 사업명 + 핵심 키워드 명시적 연결
- 권위 신호: 정부 공식 링크, 업데이트 일자

### 12.6 GSC CTR 모니터링

- 사이트 런칭 후 multisite-dashboard 연동
- AI Overview 카니발 체크 (CTR 급락 = AI Overview 노출 시그널)

---

## 13. 환경 변수

```env
# Database
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# AI
GEMINI_API_KEY=
GEMINI_MODEL_FLASH=gemini-2.0-flash
GEMINI_MODEL_PRO=gemini-2.0-pro

# Bizinfo / 공공데이터포털
BIZINFO_API_KEY=
KSTARTUP_API_KEY=

# Auth (Phase 2)
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Phase 2)
RESEND_API_KEY=

# Cron security
CRON_SECRET=

# IndexNow
INDEXNOW_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=
GSC_CLIENT_EMAIL=
GSC_PRIVATE_KEY=

# AdSense
NEXT_PUBLIC_ADSENSE_CLIENT=
```

---

## 14. Phase 1 / Phase 2-3 로드맵

### Phase 1 — MVP 런칭 (4~6주)

- 데이터: 기업마당 (창업·금융 분야 + 예비창업/창업기업/청년/여성/재창업 타겟) → 활성 약 400~500건
- 콘텐츠: 시드 200개 큐레이션 우선 발행, 점진 확장 → 1,000건
- 페이지: 사업 상세, 지역, 지역×업종(주요 17×주요 6업종 = 102), 타겟별 5개, 월별 마감 12, 비교 페이지 10
- 기능: 자격 적합도 체크 (비로그인), 유사 사업, 작년 대비 시그널
- AdSense 승인 신청
- 가이드·체크리스트 30개 작성

### Phase 1.5 — 수익화 강화 (2~3주)

- Affiliate 슬롯 통합
- AdSense 최적화 (RPM 측정, 슬롯 위치 A/B)
- 비교 페이지 50개로 확장

### Phase 2 — 회원 / 알림 (3~4주)

- Auth.js Google 로그인
- 적합도 결과 가입자 전체 노출
- 마감 임박 이메일 알림 (Resend)
- K-Startup 합격자 PDF 파싱 → 경쟁률·난이도 derived metric
- 합격사례 분석 페이지 (`/cases/[year]`)

### Phase 3 — 확장 (1~2개월)

- R&D 사업 (TIPS, 청년창업사관학교)
- 바우처·인력지원금
- 영문 버전 (`/en/`)

---

## 15. 5-페르소나 검토 결과 (의사결정 근거)

### 15.1 페르소나별 핵심 입장

**① Revenue PM**
- 우려: "창업지원금" 키워드 자체 CPC 낮음 (정부 무료정보)
- 기회: 인접 키워드 — 사업자 대출, 회계 SaaS, 법무 — CPC 폭발적
- 결론: AdSense 단독 RPM 한계 → **affiliate 병행 필수**, 가입 동선 → 이메일 시퀀스

**② SEO 전략가**
- 우려: 기업마당·K-Startup 도메인 권위 강력. 같은 raw로는 못 이김
- 최대 리스크: **Scaled Content Abuse** — 자동생성 5,000페이지는 자살
- 결론: 시드 200개 수동 큐레이션 → 1,000개 → 점진. derived metrics가 차별화 핵심

**③ 창업자 UX** (32세 카페 창업 준비)
- 진짜 needs: "내가 받을 수 있는 거 뭐임?" 한 번에
- 신뢰 신호: "작년 합격자 N명, 평균 X백만원" 정량 데이터
- 결론: 신청 가이드 + 체크리스트 + 사업계획서 템플릿이 진짜 가치

**④ 데이터 엔지니어**
- 우려: `bsnsSumryCn` 짧을 가능성 → PDF 파싱 파이프라인 Phase 1 필수
- 운영: 매일 D-day 갱신, 마감 사업 자동 noindex+archive, dedup
- 비용: 1,300건×일일 = 월 39K 호출, Vercel Hobby 한도 내

**⑤ 법무·정책 리스크**
- 가드레일: 단정 표현 금지, AI 본문 disclaimer + canonical, 광고 라벨, 면허 영역 회피
- 공공데이터 라이선스 OK (출처 표기 의무)

### 15.2 합의 결과 (스펙 반영)

✅ 시드 200개 큐레이션 → 1,000개 → 단계 확장 (§7.3, §14)
✅ 상세 PDF 파싱 파이프라인 Phase 1 필수 포함 (§3.4, §7.1)
✅ Affiliate 트랙 병행 설계 (§10.3)
✅ 콘텐츠 자산 추가: 합격 후기, 체크리스트, 사업계획서 템플릿 (§14, §6)
✅ 법무 가드레일 표준화 (§11)
⚖ Conflict 절충: 적합도 체크 결과는 비로그인 일부 노출 + 상세는 가입 (§6.3)

---

## 16. Sprint Plan (Phase 1, 4~6주)

### Sprint 1 (1주차) — Foundation

- [ ] 레포 셋업 (Next.js 15 + Turso + Drizzle + pnpm)
- [ ] 환경변수 정리, Vercel 연결
- [ ] 공공데이터포털 API 키 발급 (BIZINFO, KSTARTUP)
- [ ] DB 스키마 마이그레이션
- [ ] 기업마당 API 1회 실호출 검증 — `bsnsSumryCn` 길이 실측 ⚠
- [ ] 도메인 확정 (moneymap.kr 1순위)
- [ ] universal CLAUDE.md / SEO 표준 적용
- [ ] CSS·디자인 시스템 (Tailwind + shadcn/ui)

### Sprint 2 (2주차) — Data Pipeline

- [ ] `/api/cron/sync` — 기업마당 sync (delta + dedup)
- [ ] `/api/cron/refresh-status` — D-day 갱신
- [ ] PDF 파싱 파이프라인 — pdf-parse + Gemini Flash 구조화
- [ ] `/api/cron/generate-meta` — 임베딩 + 자격 구조화
- [ ] 시드 200개 스코어링 (예산 60% + 타겟 25% + 임박 15%)
- [ ] sitemap.ts, robots.ts, IndexNow 설정

### Sprint 3 (3주차) — Content Pipeline

- [ ] AI 본문 생성 (Gemini Pro) — 5단계 quality gate
- [ ] critic mode 구현
- [ ] dedup (cosine similarity)
- [ ] `/api/cron/generate-content` — 큐 처리, 일일 상한
- [ ] 시드 50건 published

### Sprint 4 (4주차) — Pages

- [ ] `/programs/[slug]` — 사업 상세 템플릿
- [ ] `/regions/[region]` + `/regions/[region]/[industry]`
- [ ] `/categories/[target]`
- [ ] `/deadline/[year]/[month]`
- [ ] `/check` + `/check/result` (비로그인 일부 노출)
- [ ] 홈 (`/`) — 큐레이션, 마감 임박, 신규
- [ ] 7-day dry run 시작

### Sprint 5 (5주차) — Launch Prep

- [ ] 가이드 30건 (체크리스트, 사업계획서 템플릿, 합격 사례 분석)
- [ ] 비교 페이지 10개 큐레이션
- [ ] AdSense Auto Ads 통합 (publish 미점등)
- [ ] GA4, GSC, Naver Search Advisor 연동
- [ ] multisite-dashboard 연동
- [ ] AdSense 신청 (publish 100건 + GSC 색인 80% 도달 후)

### Sprint 6 (6주차) — Iterate

- [ ] AdSense 승인 / 거절 대응 (adsense-optimizer skill)
- [ ] CTR·RPM 측정
- [ ] Phase 1.5 affiliate 통합 시작

---

## 17. 개발 검증 체크리스트

### 17.1 데이터 정합성

- [ ] sync 후 모든 program에 application_start, application_end가 정상 파싱되는가
- [ ] dedup이 K-Startup ↔ 기업마당 중복을 정확히 잡는가
- [ ] 마감일 지난 사업은 `status=closed`, `noindex`, sitemap에서 제외되는가
- [ ] PDF 파싱 실패 시 fallback 처리 (raw summary만 사용)

### 17.2 콘텐츠 품질

- [ ] critic mode 통과율 측정 (목표 70%+)
- [ ] 단정 표현 자동 검출 ("받을 수 있다", "확정", "보장")
- [ ] dedup cosine 임계값 0.85 적정성 검증
- [ ] 본문 chunk 50~150단어 범위 준수

### 17.3 SEO

- [ ] 모든 페이지 canonical 정상
- [ ] sitemap lastmod 실제 콘텐츠 변경 시점과 일치
- [ ] JSON-LD 검증 (Google Rich Results Test)
- [ ] OG 이미지 동적 생성 정상

### 17.4 성능

- [ ] LCP < 2.5s (PageSpeed Insights, 모바일)
- [ ] CLS < 0.1
- [ ] ISR revalidation 정상

### 17.5 법무·안전

- [ ] 모든 사업 페이지 disclaimer 노출
- [ ] 광고 슬롯 명시 라벨
- [ ] 원공고 canonical 링크 동작

---

## 18. 미해결 / Open Questions

1. **`bsnsSumryCn` 본문 충실도 실측** — Sprint 1 첫 작업. 길이가 500자 이상이면 PDF 파싱 우선순위 낮춤, 200자 이하면 PDF 파싱 필수.
2. **도메인 가용성** — moneymap.kr 가능 여부 확인. 막히면 changeopmoneymap.com / fundmap.kr 순.
3. **소상공인 정책자금 / 중진공 정책자금 API** — 공공데이터포털에 별도 등록 여부 추가 검증 필요. Phase 1 후반에.
4. **K-Startup 합격자 명단 PDF 파싱** — 실제 합격자 명단이 PDF인지 한글 파일인지, 비식별화 처리 여부 — Phase 2 진입 전 검증.
5. **Affiliate 파트너 선정** — Phase 1.5. 사업자 대출 비교 사이트 어디와 제휴할지 (담비, 핀다 등 검토).

---

## 19. Claude Code 실행 지침

### 19.1 코딩 표준

- 모든 코드는 TypeScript strict
- API 라우트는 zod 검증
- DB 액세스는 Drizzle (raw SQL 금지)
- Gemini 호출은 wrapper 함수 통일 (`lib/ai/gemini.ts`)
- 모든 cron endpoint는 `CRON_SECRET` 헤더 검증

### 19.2 Git 정책

- main 브랜치만 사용 (1인 개발)
- 커밋 메시지: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` 접두사
- Vercel preview 자동 배포

### 19.3 5-페르소나 사전 코드 검토

대규모 변경 (스키마 마이그레이션, 콘텐츠 파이프라인, 라우팅 구조) 시 가상 5-페르소나 검토 후 진행. 합의 안되면 멈추고 사용자에게 확인 요청.

### 19.4 하지 말 것

- ❌ Vercel localStorage / sessionStorage (artifacts 환경 외에서도 동일)
- ❌ 자동 본문 재생성 (Scaled Content Abuse 회피)
- ❌ 단정 표현이 들어간 AI 출력 publish
- ❌ Vercel Cron 사용 (GitHub Actions 사용)
- ❌ Vercel Hobby 한도 초과 코드 (이미지 최적화, 함수 호출 한도 모니터)
- ❌ 정부 공식 표현·로고 무단 사용

### 19.5 멈춤 조건

다음 발생 시 자율 진행 멈추고 사용자에게 확인:

- 5-페르소나 검토 합의 실패
- AdSense 거절 (adsense-optimizer skill로 진단 후 사용자 결정)
- API rate limit 초과
- critic mode 통과율 50% 미만 (프롬프트 재설계 필요 시그널)
- 도메인 미확정 / 환경변수 미설정

---

**END OF SPECIFICATION v1.0**
