// Import swisseph (Swiss Ephemeris)
import swisseph from 'swisseph';
import colors from 'ansi-colors';

export async function getSwissEphHouses(
    jd: number,
    latitude: number,
    longitude: number
): Promise<any> {
        return swisseph.swe_houses(
            jd,
            latitude,
            longitude,
            "P",
            (res: any) => res
        );
}

export async function getPlacidusCusps(
    jd: number,
    latitude: number,
    longitude: number
): Promise<number[]> {
    // Calculate with Swiss Ephemeris
    let sweCusps;
    try {
      sweCusps = await getSwissEphHouses(jd, latitude, longitude);
    } catch (err) {
      console.error(colors.red('Swiss Ephemeris error:'), err);
      throw err;
    }
    return sweCusps;
}

export function getJulianDay(date: Date): number {
  // swisseph expects Julian Day in UT
  // date: JS Date object (UTC)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600 + date.getUTCMilliseconds() / 3600000;
  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}
