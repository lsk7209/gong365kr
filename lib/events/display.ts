import type { EventStatus } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

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

export function getEventSummary(
  event: Pick<EventListItem, "summaryShort" | "eventType" | "areaName">,
) {
  if (event.summaryShort) return event.summaryShort;
  const type = getEventType(event);
  const area = getEventArea(event);
  return `${area} ${type} 행사 공고입니다. 자세한 사항은 원문에서 확인하세요.`;
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

export function isEventClosed(
  event: Pick<EventListItem, "eventEnd" | "status">,
  now = new Date(),
) {
  if (event.status === "closed") {
    return true;
  }

  return Boolean(
    event.eventEnd && endOfDay(event.eventEnd).getTime() < now.getTime(),
  );
}

export function formatEventDate(date: Date | null) {
  if (!date) {
    return "상시";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
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

export function formatEventDeadline(
  event: Pick<EventListItem, "receptionEnd" | "eventEnd" | "status">,
  now = new Date(),
) {
  if (isEventClosed({ eventEnd: event.eventEnd, status: event.status }, now)) {
    return "행사 종료";
  }

  const deadlineDate = event.receptionEnd ?? event.eventEnd;

  if (!deadlineDate) {
    return "접수일 확인";
  }

  const today = startOfDay(now).getTime();
  const deadline = startOfDay(deadlineDate).getTime();
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

function endOfDay(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}
