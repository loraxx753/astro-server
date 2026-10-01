import sweph from "sweph";
import * as positions from "../lib/constants/SwissEphemerisObjectIds.js";

const { constants } = sweph;

export function getSwissEphPlanetPositions(jd: number) {
  const results: Record<string, any> = {};

  Object.entries(positions.planets).forEach(([name, id]) => {
    if (name === "earth") return;

    const res = sweph.calc_ut(
      jd,
      id,
      constants.SEFLG_SWIEPH | constants.SEFLG_SPEED
    );

    // A non-negative flag with an error string is just the Moshier fallback warning.
    if (res.flag !== constants.ERR) {
      const [longitude, latitude, , longitudeSpeed] = res.data;
      results[name] = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        longitude,
        latitude,
        speed: longitudeSpeed,
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
  const result = sweph.houses(jd, latitude, longitude, "P");
  if (result.flag !== constants.OK) {
    throw new Error("Can't calculate houses.");
  }
  const [
    ascendant,
    mc,
    armc,
    vertex,
    equatorialAscendant,
    kochCoAscendant,
    munkaseyCoAscendant,
    munkaseyPolarAscendant,
  ] = result.data.points;
  return {
    house: result.data.houses.slice(0, 12),
    ascendant,
    mc,
    armc,
    vertex,
    equatorialAscendant,
    kochCoAscendant,
    munkaseyCoAscendant,
    munkaseyPolarAscendant,
  };
}
