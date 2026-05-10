const SEO_DEFAULT_TIMEZONE = "Asia/Seoul";

export function getSeoulDate(referenceDate: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: SEO_DEFAULT_TIMEZONE
  });

  const [year, month, day] = formatter.format(referenceDate).split("-");

  return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
}
