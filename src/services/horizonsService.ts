import { raDecToEclipticOfDate, jdTTfromUTC, jdUTC } from '../utils.js';
import { DateTime } from 'luxon';
import tz_lookup from 'tz-lookup';

// Alias for birth chart usage
export async function getHorizonsBirthChartPositions(
  date: string,
  time: string,
  latitude: number,
  longitude: number,
  bodies: string[]
): Promise<HorizonsPlanetPosition[]> {
  return await fetchHorizonsPositions({
    date,
    time,
    location: { lat: latitude, lon: longitude },
    bodies,
  });
}
// horizonsService.ts
// Fetches planetary positions from NASA HORIZONS and returns them for astrological calculations.
// This is a basic scaffold. You can expand error handling, caching, and support for more bodies as needed.


export interface HorizonsPlanetPosition {
  name: string;
  longitude: number; // degrees
  latitude: number;  // degrees
  distance?: number;  // AU or km, as returned
  ra: number;        // degrees, apparent RA
  dec: number;       // degrees, apparent Dec
  dateStr: string;   // timestamp string from HORIZONS
}

export interface HorizonsRequestOptions {
  date: string; // ISO string
  time: string; // ISO string
  location: { lat: number; lon: number };
  bodies: string[]; // e.g., ['Mercury', 'Venus', 'Mars']
}

// Map planet names to HORIZONS IDs
const HORIZONS_IDS: Record<string, string> = {
  Mercury: '199',
  Venus: '299',
  Earth: '399',
  Mars: '499',
  Jupiter: '599',
  Saturn: '699',
  Uranus: '799',
  Neptune: '899',
  Pluto: '999',
  Sun: '10',
  Moon: '301',
};

export async function fetchHorizonsPositions(options: HorizonsRequestOptions): Promise<HorizonsPlanetPosition[]> {
  const results: HorizonsPlanetPosition[] = [];
  for (const body of options.bodies) {
    console.log(options.date, options.time, body);
    const id = HORIZONS_IDS[body];
    if (!id) continue;
    // Calculate STOP_TIME as 1 minute after START_TIME
    // Use tz-lookup to get IANA timezone from lat/lon
    const zone = tz_lookup(options.location.lat, options.location.lon);
    // Parse options.datetime as local time in the observer's timezone
    let startStr, stopStr;
    // Detect BCE format: if options.date starts with 'bc '
    if (options.date.startsWith('bc ')) {
      // For BCE, use the string directly, and increment minute for stopStr
      const match = options.date.match(/^bc (\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/);
      if (match) {
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hour = parseInt(match[4], 10);
        const minute = parseInt(match[5], 10);
        startStr = `${options.date} ${options.time}`;
        // Increment minute for stopStr manually
        let stopHour = hour, stopMinute = minute + 1;
        if (stopMinute >= 60) {
          stopMinute = 0;
          stopHour = (stopHour + 1) % 24;
        }
        stopStr = `bc ${year}-${month}-${day} ${String(stopHour).padStart(2, '0')}:${String(stopMinute).padStart(2, '0')}`;
      } else {
        throw new Error('Invalid BCE date format for HORIZONS');
      }
      // SKIP Luxon for BCE
    } else {
      const localStart = DateTime.fromFormat(`${options.date} ${options.time}`, 'yyyy-MM-dd HH:mm:ss', { zone });
      const localStop = localStart.plus({ minutes: 1 });
      startStr = localStart.toUTC().toFormat('yyyy-MM-dd HH:mm:ss');
      stopStr = localStop.toUTC().toFormat('yyyy-MM-dd HH:mm:ss');
    }
    let url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${id}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='${startStr}'&STOP_TIME='${stopStr}'&STEP_SIZE='1 m'&QUANTITIES='1,2'&ANG_FORMAT='DEG'&CSV_FORMAT='YES'`;
    let resp, json;
    try {
      resp = await fetch(url);
      json = await resp.json();
    } catch (err) {
      continue;
    }

    // Fallback if date cannot be interpreted (only for AD dates, skip for BCE)
    if (json.result && json.result.includes('Cannot interpret date') && !options.date.startsWith('bc ')) {
      // Only use Luxon for AD dates
      let startStrFallback, stopStrFallback;
      try {
        const localStart = DateTime.fromFormat(`${options.date} ${options.time}`, 'yyyy-MM-dd HH:mm:ss', { zone });
        const localStop = localStart.plus({ minutes: 1 });
        startStrFallback = localStart.toUTC().toFormat('yyyy-MMM-dd HH:mm');
        stopStrFallback = localStop.toUTC().toFormat('yyyy-MMM-dd HH:mm');
      } catch {
        // If Luxon fails, skip fallback
        return results;
      }
      url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${id}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='${startStrFallback}'&STOP_TIME='${stopStrFallback}'&STEP_SIZE='1 m'&QUANTITIES='1,2'&ANG_FORMAT='DEG'&CSV_FORMAT='YES'`;
      try {
        resp = await fetch(url);
        json = await resp.json();
      } catch (err) {
        continue;
      }
    }

    const block = json.result.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
    if (!block) {
      throw new Error("No data section");
    }

    const lines = block[1].trim().split('\n').filter(Boolean);
    for (const line of lines) {
      const cols = line.split(',').map((s:string) => s.trim());

      const dateStr = cols[0];
      const raApp   = parseFloat(cols[5]);
      const decApp  = parseFloat(cols[6]);

      const jdInUTC = jdUTC(new Date(dateStr));
      const jdTT = jdTTfromUTC(jdInUTC, 69); // approx. delta T
      const { lon, lat } = raDecToEclipticOfDate(raApp, decApp, jdTT);
      results.push({ name: body, ra: raApp, dec: decApp, longitude: lon, latitude: lat, dateStr });
    }
  }
  return results;
}
