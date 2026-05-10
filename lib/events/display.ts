import type { EventStatus } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SUMMARY = "이벤트 상세 내용은 기업마당 또는 출처 페이지에서 확인할 수 있습니다.";
const DEFAULT_ORG = "출처 기관 확인 필요";
const DEFAULT_TYPE = "이벤트";
const DEFAULT_AREA = "전국";

export type EventListItem = {
  id: number;
  eventInfoId: string;
  slug: string;
  title: string;
  summaryShort: string | null;
  areaName: string | null;
  eventType: string | null;
  originOrg: string | null;
  categoryCode: string | null;
  receptionStart: Date | null;
  receptionEnd: Date | null;
  eventStart: Date | null;
  eventEnd: Date | null;
  status: EventStatus;
  rawUrl: string;
  originUrl: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  printFileUrl: string | null;
  printFileName: string | null;
  createdAt: Date;
  lastSyncedAt: Date;
};

export function getEventSummary(event: Pick<EventListItem, "summaryShort">) {
  return event.summaryShort ?? DEFAULT_SUMMARY;
}

export function getEventOrg(event: Pick<EventListItem, "originOrg">) {
  return event.originOrg ?? DEFAULT_ORG;
}

export function getEventType(event: Pick<EventListItem, "eventType">) {
  return event.eventType ?? DEFAULT_TYPE;
}

export function getEventArea(event: Pick<EventListItem, "areaName">) {
  return event.areaName ?? DEFAULT_AREA;
}

export function formatEventDate(date: Date | null) {
  if (!date) {
    return "상시";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul"
  }).format(date);
}

export function formatEventPeriod(start: Date | null, end: Date | null) {
  if (!start && !end) {
    return "일정 확인 필요";
  }

  if (start && end) {
    const startText = formatEventDate(start);
    const endText = formatEventDate(end);

    return startText === endText ? startText : `${startText} ~ ${endText}`;
  }

  return formatEventDate(start ?? end);
}

export function formatEventDeadline(date: Date | null, now = new Date()) {
  if (!date) {
    return "접수일 확인";
  }

  const today = startOfDay(now).getTime();
  const deadline = startOfDay(date).getTime();
  const daysLeft = Math.ceil((deadline - today) / DAY_MS);

  if (daysLeft < 0) {
    return "접수 종료";
  }

  if (daysLeft === 0) {
    return "오늘 마감";
  }

  return `D-${daysLeft}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
