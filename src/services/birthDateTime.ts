import { DateTime } from 'luxon';
import tzLookup from 'tz-lookup';
import sweph from 'sweph';

const BIRTH_DATETIME_FORMATS = ['yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm'] as const;

export function parseLocalBirthDateTime(
  date: string,
  time: string,
  timezone: string
): DateTime {
  const raw = `${date} ${time}`.trim();
  for (const format of BIRTH_DATETIME_FORMATS) {
    const dt = DateTime.fromFormat(raw, format, { zone: timezone });
    if (dt.isValid) return dt;
  }
  throw new Error(`Invalid birth date/time "${raw}"`);
}

export function julianDayFromLocalBirth(
  date: string,
  time: string,
  latitude: number,
  longitude: number
): { jd: number; timezone: string; local: DateTime; utc: DateTime } {
  const timezone = tzLookup(latitude, longitude);
  const local = parseLocalBirthDateTime(date, time, timezone);
  const utc = local.toUTC();
  const jd = sweph.julday(
    utc.year,
    utc.month,
    utc.day,
    utc.hour + utc.minute / 60 + utc.second / 3600,
    sweph.constants.SE_GREG_CAL
  );
  return { jd, timezone, local, utc };
}
