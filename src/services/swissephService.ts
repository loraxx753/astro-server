import swisseph from "swisseph";
import * as positions from "../lib/constants/SwissEphemerisObjectIds.js";

export function getSwissEphPlanetPositions(jd: number) {
  const results: Record<string, any> = {};

  Object.entries(positions.planets).forEach(([name, id]) => {
    if (name === "earth") return;

    const res = swisseph.swe_calc_ut(
      jd,
      id,
      swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED
    );

    if ("longitude" in res) {
      results[name] = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        longitude: res.longitude,
        latitude: res.latitude,
        speed: res.longitudeSpeed,
      };
    }
  });

  return results;
}

export async function getSwissEphHouses(
  jd: number,
  latitude: number,
  longitude: number
): Promise<any> {
  const result = swisseph.swe_houses(jd, latitude, longitude, "P");
  if ("error" in result) {
    throw new Error(result.error);
  }
  return {
    ...result,
    // JS binding already maps C cusps[1..12] onto a 12-length array.
    house: result.house.slice(0, 12),
  };
}
