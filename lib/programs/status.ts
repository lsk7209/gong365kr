import type { ProgramStatus } from "./types";

export function calculateProgramStatus(input: {
  applicationStart: Date | null;
  applicationEnd: Date | null;
  now: Date;
}): ProgramStatus {
  if (input.applicationStart && input.applicationStart.getTime() > input.now.getTime()) {
    return "upcoming";
  }

  if (input.applicationEnd && endOfDay(input.applicationEnd).getTime() < input.now.getTime()) {
    return "closed";
  }

  return "active";
}

export function toUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function endOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}
