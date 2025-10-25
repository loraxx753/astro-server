import { getHorizonsBirthChartPositions } from './src/services/horizonsService';
import colors from 'ansi-colors';
import { DateTime } from 'luxon';
import tzLookup from 'tz-lookup';

// Import swisseph (Swiss Ephemeris)
import swisseph from 'swisseph';

// Test cases for validation

const referenceData = [
  {
    name: "Kevin Baugh Test Case",
    date: "1984-08-18",
    time: "08:03:00",
    latitude: 28.078611,
    longitude: -80.602778,
    bodies: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
  },
  {
    name: "Simran Gill Test Case",
    date: "1991-02-16",
    time: "06:10:00",
    latitude: 30.266944,
    longitude: -97.742778,
    bodies: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
  },
  // {
  //   name: "Albert Einstein Test Case",
  //   date: "1879-03-14",
  //   time: "11:30:00",
  //   latitude: 48.1351,
  //   longitude: 11.5820,
  //   bodies: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
  // },
  // {
  //   name: "US Founding Test Case",
  //   date: "1776-07-04",
  //   time: "12:00:00",
  //   latitude: 39.9526, // Philadelphia, PA
  //   longitude: -75.1652,
  //   bodies: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
  // },

];

// Set date and timezone for each test case
for (const testCase of referenceData) {

  testCase.timezone = tzLookup(testCase.latitude, testCase.longitude);
  // Local time as Luxon DateTime objectt5 3f
  testCase.localDateTime = DateTime.fromFormat(`${testCase.date} ${testCase.time}`, 'yyyy-MM-dd HH:mm:ss', { zone: testCase.timezone });
  // UTC JS Date for Swiss Ephemeris
  testCase.utcDateTime = testCase.localDateTime.toUTC().toJSDate();
}


// function parseCalculatedPosition(zodiacPos) {
//   const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
//     'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
//   const signIndex = signs.indexOf(zodiacPos.sign);
//   return signIndex * 30 + zodiacPos.degree + zodiacPos.minutes / 60 + (zodiacPos.seconds || 0) / 3600;
// }

// function calculateError(calculated, expected) {
//   const diff = Math.abs(calculated - expected);
//   // Handle wrap-around at 0°/360°
//   return Math.min(diff, 360 - diff);
// }


// Map planet names to Swiss Ephemeris constants
const PLANET_MAP = {
  sun: swisseph.SE_SUN,
  moon: swisseph.SE_MOON,
  mercury: swisseph.SE_MERCURY,
  venus: swisseph.SE_VENUS,
  mars: swisseph.SE_MARS,
  jupiter: swisseph.SE_JUPITER,
  saturn: swisseph.SE_SATURN
};

// Helper: get Julian Day in UT
function getJulianDay(date) {
  // swisseph expects Julian Day in UT
  // date: JS Date object (UTC)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600 + date.getUTCMilliseconds() / 3600000;
  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

// Helper: decimal degrees to zodiac sign/deg/min
function decimalToZodiac(deg) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  let d = deg % 360;
  if (d < 0) d += 360;
  const signIndex = Math.floor(d / 30);
  const sign = signs[signIndex];
  const degree = Math.floor(d % 30);
  const minutes = Math.floor((d % 1) * 60);
  const seconds = Math.round((((d % 1) * 60) % 1) * 60);
  return { degree, minutes, seconds, sign };
}

async function getSwissephLongitude(jd, planet) {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(jd, planet, swisseph.SEFLG_SWIEPH, (res) => {
      if (res.error) {
        reject(res.error);
      } else {
        resolve(res.longitude);
      }
    });
  });
}

function getLocalTimeWithTimezone(date, timezone) {
  // Use Luxon to convert UTC JS Date to local time in the given IANA timezone
  return DateTime.fromJSDate(date, { zone: 'utc' }).setZone(timezone);
}

async function runAccuracyTest() {
  console.log('🎯 Astronomical Accuracy Validation Test (vs Swiss Ephemeris)\n');


  for (const testCase of referenceData) {
    console.log(`\n📊 Testing: ${testCase.name}`);
    console.log(`Date (input): ${testCase.date} ${testCase.time} (${testCase?.timezone})`);
    console.log(`Location: ${testCase.latitude}°, ${testCase.longitude}°\n`);

    // Use localDateTime for HORIZONS request
    // const localString = testCase.localDateTime.toFormat('yyyy-MM-dd HH:mm:ss');
    // console.log('HORIZONS request datetime (local for observer):', localString);


    // Request all planets from HORIZONS using local time
    const horizonsPositions = await getHorizonsBirthChartPositions(
      testCase.date,
      testCase.time,
      testCase.latitude,
      testCase.longitude,
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
    );

    // Calculate Julian Day for Swiss Ephemeris (UTC)
    const jd = getJulianDay(testCase.utcDateTime);

    // Color maps for elements and planets
    const signData = [
      { name: 'Aries', unicode: '♈', element: 'fire' },
      { name: 'Taurus', unicode: '♉', element: 'earth' },
      { name: 'Gemini', unicode: '♊', element: 'air' },
      { name: 'Cancer', unicode: '♋', element: 'water' },
      { name: 'Leo', unicode: '♌', element: 'fire' },
      { name: 'Virgo', unicode: '♍', element: 'earth' },
      { name: 'Libra', unicode: '♎', element: 'air' },
      { name: 'Scorpio', unicode: '♏', element: 'water' },
      { name: 'Sagittarius', unicode: '♐', element: 'fire' },
      { name: 'Capricorn', unicode: '♑', element: 'earth' },
      { name: 'Aquarius', unicode: '♒', element: 'air' },
      { name: 'Pisces', unicode: '♓', element: 'water' }
    ];

    const elementColors = {
      fire: colors.red.bold,
      earth: colors.green.bold,
      air: colors.cyan.bold,
      water: colors.blue.bold
    };

    const planetData = {
      Sun: { unicode: '☉', color: colors.yellow.bold },
      Moon: { unicode: '☽', color: colors.white.bold },
      Mercury: { unicode: '☿', color: colors.gray.bold },
      Venus: { unicode: '♀', color: colors.green.bold },
      Mars: { unicode: '♂', color: colors.red.bold },
      Jupiter: { unicode: '♃', color: colors.blue.bold },
      Saturn: { unicode: '♄', color: colors.magenta.bold }
    };

    for (const planet of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
      const horizonsPlanet = horizonsPositions.find(p => p.name.toLowerCase() === planet.toLowerCase());
      let sweLongitude = null;
      try {
        sweLongitude = await getSwissephLongitude(jd, PLANET_MAP[planet.toLowerCase()]);
      } catch (err) {
        sweLongitude = null;
      }
      const horizonsLongitude = horizonsPlanet ? horizonsPlanet.longitude : null;
      // Use HORIZONS longitude for display if available, else Swiss Ephemeris
      const displayLongitude = typeof horizonsLongitude === 'number' ? horizonsLongitude : sweLongitude;
      let diffMinutes = null;
      if (typeof horizonsLongitude === 'number' && typeof sweLongitude === 'number' && !isNaN(horizonsLongitude) && !isNaN(sweLongitude)) {
        let diff = Math.abs(horizonsLongitude - sweLongitude);
        diff = Math.min(diff, 360 - diff); // handle wrap-around
        diffMinutes = (diff * 60).toFixed(1);
      }
      // Get zodiac info
      const zodiac = typeof displayLongitude === 'number' ? decimalToZodiac(displayLongitude) : null;
      const signIdx = zodiac ? signData.findIndex(s => s.name === zodiac.sign) : -1;
      const sign = signIdx >= 0 ? signData[signIdx] : null;
      const signColor = sign ? elementColors[sign.element] : colors.white.bold;
      const planetInfo = planetData[planet];
      // Output
      if (planetInfo && zodiac && sign) {
        console.log(planetInfo.color(`${planetInfo.unicode} ${planet}`));
        console.log(planetInfo.color('============================='));
        console.log(colors.bold(`${zodiac.degree}° ${zodiac.minutes}' ${zodiac.seconds}"`));
        console.log(`Ruled by the sign ${signColor(`${sign.unicode} ${sign.name}`)}`);
        if (diffMinutes !== null) {
          const diffVal = parseFloat(diffMinutes);
          if (diffVal <= 1.0) {
            console.log(`${colors.green('✅')} ${colors.green.bold('Exact match!')}`);
          } else {
            console.log(`${colors.red('❌')} off by ${diffMinutes} arcmin`);
          }
        }
        console.log('');
      } else {
        // Fallback to table row if data missing
        const row = `| ${planet.padEnd(8)} | ${horizonsLongitude !== null ? horizonsLongitude.toFixed(8).padEnd(17) : 'ERR'.padEnd(17)} | ${sweLongitude !== null ? sweLongitude.toFixed(8).padEnd(24) : 'ERR'.padEnd(24)} | ${diffMinutes !== null ? diffMinutes.padEnd(19) : 'ERR'.padEnd(19)} |`;
        console.log(row);
      }
    }
  }
}

// Run the test
runAccuracyTest().catch(console.error);