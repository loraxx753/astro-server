import { getHorizonsBirthChartPositions } from './services/horizonsService.js';
import { geocodeLocation } from './services/geocoding.js';
import { reverseGeocode } from './services/geocoding.js';
import {getPlacidusCusps, getJulianDay, getSwissEphHouses} from './services/swissephService.js';
import swisseph from 'swisseph';
import tzLookup from 'tz-lookup';
import { DateTime } from 'luxon';



export const resolvers = {
  Query: {
    async latLongFromLocation(_: any, { city, country, region }: { city: string; country: string; region?: string }) {
      // Use geocodeLocation service, mapping region to state for compatibility
      try {
        const result = await geocodeLocation({ city, country, state: region });
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          formattedAddress: result.formattedAddress,
          confidence: result.confidence,
        };
      } catch (error) {
        // Return a GraphQL-friendly error
        throw new Error(error instanceof Error ? error.message : 'Geocoding failed');
      }
    },
    async planetaryPositions(_: any, { date, time, latitude, longitude, city, region, country, bodies }: { date: string; time: string; latitude?: number; longitude?: number; city?: string; region?: string; country?: string; bodies: string[] }) {
      if(!latitude || !longitude) {
        // If lat/long not provided, attempt to geocode from city/country/region
        if(city && country) {
          const geoResult = await geocodeLocation({ city, country, state: region });
          latitude = geoResult.latitude;
          longitude = geoResult.longitude;
        } else {
          throw new Error('Either latitude/longitude or city/country must be provided');
        }
      }
      return await getHorizonsBirthChartPositions(date, time, latitude, longitude, bodies);
    },
    async locationFromLatLong(_: any, { latitude, longitude }: { latitude: number; longitude: number }) {
      try {
        const result = await reverseGeocode(latitude, longitude);
        return {
          city: result.city,
          state: result.state,
          country: result.country,
        };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Reverse geocoding failed');
      }
    },
    async housePositions(_: any, { date, time, latitude, longitude }: { date: string; time: string; latitude: number; longitude: number; }) {
    const timezone = tzLookup(latitude, longitude);
    const localDateTime = DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone: timezone });
    const utcDateTime = localDateTime.toUTC();
    const jd = swisseph.swe_julday(
      utcDateTime.year,
      utcDateTime.month,
      utcDateTime.day,
      utcDateTime.hour + utcDateTime.minute / 60 + utcDateTime.second / 3600,
      swisseph.SE_GREG_CAL
    );
      return await getSwissEphHouses(jd, latitude, longitude);
    }
  },
  Mutation: {
    // async createClientChart(_: any, input: IClientChart) {
    //   const chart = new ClientCharts(input);
    //   await chart.save();
    //   return chart;
    // },
    // async deleteClientChart(_: any, { id }: { id: string }) {
    //   return await ClientCharts.findByIdAndDelete(id);
    // },
  },
};
