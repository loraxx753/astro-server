import colors from 'ansi-colors';
import { DateTime } from 'luxon';
import tzLookup from 'tz-lookup';
import { getJulianDay } from './src/services/swissephService';
import { getPlacidusCusps } from './src/services/swissephService';
import swisseph from 'swisseph';
import { convertToZodiac } from './src/utils';


// Test case for validation
const referenceData = [
  {
    name: "Kevin Baugh Test Case",
    date: "1984-08-18",
    time: "08:03:00",
    latitude: 28.078611,
    longitude: -80.602778
  },
  // {
  //   name: "Simran Gill Test Case",
  //   date: "1991-02-16",
  //   time: "06:10:00",
  //   latitude: 30.266944,
  //   longitude: -97.742778,
  // },
//   {
//     name: "Albert Einstein Test Case",
//     date: "1879-03-14",
//     time: "11:30:00",
//     latitude: 48.1351,
//     longitude: 11.5820,
//   },
  // {
  //   name: "US Founding Test Case",
  //   date: "1776-07-04",
  //   time: "12:00:00",
  //   latitude: 39.9526, // Philadelphia, PA
  //   longitude: -75.1652,
  // },
];

function printHouseCusp(label, cusp, sweCusp) {
  const zodiac = convertToZodiac(cusp);
  const sweZodiac = convertToZodiac(sweCusp);
  const signsMatch = zodiac.sign === sweZodiac.sign;
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
  const sign = signData.find(s => s.name === zodiac.sign);
  const sweSign = signData.find(s => s.name === sweZodiac.sign);
  const signColor = sign ? elementColors[sign.element] : colors.white.bold;
  const sweSignColor = sweSign ? elementColors[sweSign.element] : colors.white.bold;
  console.log(
    colors.bold(`${label.padEnd(4)}:`),
    signColor(`${zodiac.unicode || ''} ${zodiac.sign} ${zodiac.degree}° ${zodiac.minutes}' ${zodiac.seconds}"`),
    colors.gray('vs'),
    sweSignColor(`${sweZodiac.unicode || ''} ${sweZodiac.sign} ${sweZodiac.degree}° ${sweZodiac.minutes}' ${sweZodiac.seconds}"`),
    signsMatch ? colors.green('✅') : colors.red('❌')
  );
}

async function getSwissEphHouses(jd, latitude, longitude) {
  return new Promise((resolve, reject) => {
    swisseph.swe_houses(jd, latitude, longitude, swisseph.SE_PLACIDUS, (res) => {
      if (res.error) reject(res.error);
      else resolve(res.house);
    });
  });
}



async function runHouseTest() {
  console.log('🏠 House Cusp Accuracy Test (vs Swiss Ephemeris)\n');
  for (const testCase of referenceData) {
    const timezone = tzLookup(testCase.latitude, testCase.longitude);
    const localDateTime = DateTime.fromFormat(`${testCase.date} ${testCase.time}`, 'yyyy-MM-dd HH:mm:ss', { zone: timezone });
    const utcDateTime = localDateTime.toUTC();
    const jd = swisseph.swe_julday(
      utcDateTime.year,
      utcDateTime.month,
      utcDateTime.day,
      utcDateTime.hour + utcDateTime.minute / 60 + utcDateTime.second / 3600,
      swisseph.SE_GREG_CAL
    );
    // Calculate with your code
    const houses = await getPlacidusCusps(jd, testCase.latitude, testCase.longitude);
    // Calculate with Swiss Ephemeris
    let sweCusps;
    try {
      sweCusps = await getSwissEphHouses(jd, testCase.latitude, testCase.longitude);
    } catch (err) {
      console.error(colors.red('Swiss Ephemeris error:'), err);
      continue;
    }

    console.log(`\n📊 Testing: ${testCase.name}`);
    console.log(`Date: ${testCase.date} ${testCase.time} (${timezone})`);
    console.log(`Location: ${testCase.latitude}°, ${testCase.longitude}°`);

    // Print each house cusp
    for (let i = 0; i <= 11; i++) {
      printHouseCusp(`${i+1}`, houses[i], sweCusps[i]);
    }

  }
}

runHouseTest().catch(console.error);