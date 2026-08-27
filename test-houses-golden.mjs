import { julianDayFromLocalBirth } from './src/services/birthDateTime.ts';
import { getSwissEphHouses } from './src/services/swissephService.ts';

const KEVIN = {
  date: '1984-08-18',
  time: '08:03',
  latitude: 28.078611,
  longitude: -80.602778,
  ascendant: 159.86787,
  mc: 68.893198,
};

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

function assertClose(actual, expected, epsilon, message) {
  const delta = Math.abs(actual - expected);
  assert(delta <= epsilon, `${message} (expected ${expected}, got ${actual}, Δ=${delta})`);
}

async function main() {
  const withMinutes = julianDayFromLocalBirth(KEVIN.date, '08:03', KEVIN.latitude, KEVIN.longitude);
  const withSeconds = julianDayFromLocalBirth(KEVIN.date, '08:03:00', KEVIN.latitude, KEVIN.longitude);
  assert(withMinutes.jd === withSeconds.jd, 'HH:mm and HH:mm:ss produce the same Julian Day');

  const houses = await getSwissEphHouses(withMinutes.jd, KEVIN.latitude, KEVIN.longitude);
  assert(houses.house.length === 12, `house array has 12 cusps (got ${houses.house.length})`);
  assertClose(houses.house[0], houses.ascendant, 1e-9, 'house[0] is the Ascendant');
  assertClose(houses.house[9], houses.mc, 1e-9, 'house[9] is the MC');
  assertClose(houses.ascendant, KEVIN.ascendant, 0.001, 'ASC is Virgo 9°52′ for the Kevin chart');
  assertClose(houses.mc, KEVIN.mc, 0.001, 'MC is Gemini 8°53′ for the Kevin chart');

  const oppositeAsc = (houses.ascendant + 180) % 360;
  assertClose(houses.house[6], oppositeAsc, 1e-6, 'house 7 is opposite the Ascendant');

  let threw = false;
  try {
    julianDayFromLocalBirth(KEVIN.date, 'not-a-time', KEVIN.latitude, KEVIN.longitude);
  } catch {
    threw = true;
  }
  assert(threw, 'invalid time throws');

  if (process.exitCode) {
    console.error('\nHouse golden tests failed.');
    process.exit(1);
  }
  console.log('\nHouse golden tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
