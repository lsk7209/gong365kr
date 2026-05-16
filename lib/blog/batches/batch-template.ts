import type { BlogPost, BlogResearchSource } from "../types";

export type ArticleInput = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  tags: string[];
  qualityScore: number;
  researchSources: BlogResearchSource[];
  problem: string;
  tableRows: Array<[string, string, string]>;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  checklist: string[];
  closing: string;
};

export function createPost(input: ArticleInput): BlogPost {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    publishedAt: input.publishedAt,
    category: input.category,
    tags: input.tags,
    content: renderArticle(input),
    researchSources: input.researchSources,
    qualityScore: input.qualityScore,
  };
}

export function officialSources(
  rows: Array<[string, string, string]>,
): BlogResearchSource[] {
  return rows.map(([title, url, publisher]) => ({
    title,
    url,
    publisher,
    checkedAt: "2026-05-16",
  }));
}

export function section(heading: string, paragraphs: string[]) {
  return { heading, paragraphs };
}

function renderArticle(input: ArticleInput): string {
  const tableRows = input.tableRows
    .map(
      ([area, check, reason]) =>
        `<tr><td>${area}</td><td>${check}</td><td>${reason}</td></tr>`,
    )
    .join("");
  const sections = input.sections
    .map(
      (item) => `<h2>${item.heading}</h2>${item.paragraphs
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("")}`,
    )
    .join("");

  return `
<article>
  <div class="tf-tldr">
    <strong>핵심 요약</strong>
    <p>${input.problem}</p>
  </div>
  <p>${input.problem}</p>
  <table>
    <thead><tr><th>영역</th><th>확인할 것</th><th>운영 이유</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  ${sections}
  ${renderPracticeNotes(input)}
  ${renderFaqs(input)}
  <h2>마무리</h2>
  <p>${input.closing}</p>
</article>`.trim();
}

function renderPracticeNotes(input: ArticleInput): string {
  const sourceNames = input.researchSources
    .map((source) => source.publisher)
    .join(", ");
  const checklist = input.checklist.map((item) => `<li>${item}</li>`).join("");

  return `
<h2>실행 체크리스트</h2>
<ul>${checklist}</ul>
<p>이 글은 ${sourceNames}의 공개 자료를 우선 확인한 뒤, 작은 팀과 매장에서 바로 적용할 수 있는 운영 절차로 다시 정리했습니다. 실제 적용 전에는 업종, 지역, 계약 조건, 보유 인력, 고객 유형이 같은지 먼저 확인해야 합니다. 같은 기준이라도 사업 단계와 현장 구조에 따라 필요한 문서와 승인 절차가 달라질 수 있습니다.</p>
<p>처음부터 완벽한 규정을 만들려고 하면 실행이 늦어집니다. 최근에 반복된 사례 하나를 골라 접수, 판단, 승인, 기록, 안내까지 한 번 통과시켜 보세요. 이 과정에서 담당자가 헷갈리는 표현, 빠진 증빙, 고객에게 설명하기 어려운 문장이 드러납니다. 작은 파일 하나를 실제 업무에 붙여보는 것이 가장 빠른 검증입니다.</p>
<p>문서가 만들어진 뒤에는 보관 위치와 개정 주기를 정해야 합니다. 오래된 문서가 최신 기준처럼 남아 있으면 현장에서 더 큰 혼란을 만듭니다. 분기마다 한 번씩 실제 사례와 비교해 맞지 않는 항목을 고치고, 바뀐 기준은 공지나 회의록에 남기세요. 운영 기준은 작성보다 갱신이 더 중요합니다.</p>
<p>고객이나 외부 파트너에게 보이는 기준이라면 내부용 판단표와 외부 안내문을 분리하는 편이 좋습니다. 내부 문서에는 승인권자, 예외 조건, 증빙 위치를 자세히 적고, 외부 안내문에는 고객이 이해해야 할 조건과 문의 경로만 간결하게 남깁니다. 두 문서가 같은 기준을 말해야 상담 품질이 흔들리지 않습니다.</p>
<p>성과 확인 지표도 하나 정해두세요. 처리 시간, 반복 문의, 환불률, 재방문율, 누락 건수, 고객 불만처럼 업무와 직접 연결되는 숫자가 좋습니다. 지표가 있어야 다음 개정 때 유지할 기준과 없앨 기준을 구분할 수 있습니다. 기록이 없는 운영 개선은 담당자의 기억에 의존하게 됩니다.</p>
<p>예외 처리는 반드시 별도로 남겨야 합니다. 모든 예외를 대표가 판단하면 병목이 생기고, 모든 예외를 현장이 판단하면 기준이 흐려집니다. 금액, 고객 영향, 법적 위험, 공개 노출 여부에 따라 어느 단계에서 승인하는지 정하면 빠른 실행과 일관성을 함께 지킬 수 있습니다.</p>
<p>공식 자료는 최종 판단의 기준점으로 활용하되, 그대로 복사해 현장 문서로 쓰기는 어렵습니다. 공고문, 정책 자료, 안내 문서는 범위가 넓기 때문에 우리 매장의 메뉴, 우리 서비스의 가격, 우리 팀의 권한 구조에 맞게 좁혀야 합니다. 이 좁히는 과정이 실무형 콘텐츠와 단순 요약의 차이를 만듭니다.</p>
<p>실행 후에는 실패 사례를 버리지 말고 다음 기준 개정에 반영하세요. 고객이 이해하지 못한 문장, 담당자가 놓친 입력값, 승인자가 반복해서 묻는 질문은 모두 문서가 아직 충분히 선명하지 않다는 신호입니다. 작은 실패를 기록으로 바꾸면 다음 담당자는 같은 시행착오를 줄일 수 있습니다.</p>
<p>가능하면 변경 전후를 비교할 수 있게 기준 적용 날짜도 남기세요. 같은 문제가 줄었는지, 처리 시간이 짧아졌는지, 고객 안내가 쉬워졌는지 확인하려면 언제부터 새 기준을 썼는지가 필요합니다. 날짜 없는 개선은 나중에 효과를 설명하기 어렵습니다.</p>
<p>마지막으로 담당자가 바뀌어도 같은 결론이 나오는지 확인해 보세요. 같은 사례를 두 명에게 주고 처리 결과가 다르면 기준이 아직 모호한 것입니다. 기준을 더 자세히 쓰기보다 판단 질문을 줄이고, 필요한 증빙을 명확히 하고, 예외 승인 위치를 분명히 하는 쪽이 효과적입니다.</p>`;
}

function renderFaqs(input: ArticleInput): string {
  return `
<h2>자주 묻는 질문</h2>
<h3>처음에는 어느 정도까지 문서화해야 하나요?</h3>
<p>처음부터 긴 규정을 만들기보다 ${input.tableRows[0][0]}, ${input.tableRows[1][0]}, ${input.tableRows[2][0]}처럼 반복해서 판단하는 항목부터 정리하는 것이 좋습니다. 각 항목에 담당자, 판단 기준, 기록 위치, 재검토 날짜를 넣으면 작은 팀에서도 바로 실행할 수 있습니다.</p>
<h3>담당자가 문서를 잘 따르지 않으면 어떻게 해야 하나요?</h3>
<p>문서가 너무 길거나 실제 도구와 연결되지 않았을 가능성이 큽니다. 결제 화면, POS, CRM, 공유 드라이브, 체크리스트처럼 담당자가 매일 보는 위치에 기준을 붙이세요. 교육보다 업무 흐름 안에 넣는 편이 오래갑니다.</p>
<h3>전문가 검토가 꼭 필요한가요?</h3>
<p>개인정보, 계약, 세금, 근로조건, 보안, 소비자 피해처럼 법적 이해관계가 큰 주제라면 전문가 검토를 받는 편이 안전합니다. 다만 전문가에게 맡기기 전에 회사의 현재 처리 방식과 원하는 기준을 정리해두면 검토 비용과 시간이 줄어듭니다.</p>
<h3>작성 후 바로 전면 적용해도 되나요?</h3>
<p>최근 사례 3개에 먼저 대입해 보는 것이 좋습니다. 기준이 너무 엄격해 업무가 멈추는지, 예외가 많아 기준 의미가 사라지는지 확인하세요. 이후 공지문과 고객 안내 문구를 맞추면 적용 실패가 줄어듭니다.</p>`;
}
