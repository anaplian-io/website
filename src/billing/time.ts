export const timezones = [
  ["America/New_York", "New York"],
  ["America/Chicago", "Chicago"],
  ["America/Denver", "Denver"],
  ["America/Phoenix", "Phoenix"],
  ["America/Los_Angeles", "Los Angeles"],
] as const;

export function localFields(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

export function utcTimestamp(date: string, time: string, timeZone: string) {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const wallTime = Date.parse(`${date}T${normalizedTime}Z`);
  if (!Number.isFinite(wallTime)) throw new Error("Enter a valid date and time.");
  for (let offset = 4; offset <= 8; offset++) {
    const candidate = new Date(wallTime + offset * 3_600_000).toISOString();
    const fields = localFields(candidate, timeZone);
    if (fields.date === date && fields.time === normalizedTime) return candidate;
  }
  throw new Error(
    "This local time does not exist because of daylight saving time. Choose another time.",
  );
}

export function billableHours(start: string, end: string | null) {
  if (!end) return 0;
  return Math.max(1, Math.round((Date.parse(end) - Date.parse(start)) / 360_000)) / 10;
}

export function displayTimestamp(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}
