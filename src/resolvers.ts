import { getHorizonsBirthChartPositions } from './services/horizonsService.js';

export const resolvers = {
  Query: {
    async planetaryPositions(_: any, { date, time, latitude, longitude, bodies }: { date: string; time: string; latitude: number; longitude: number; bodies: string[] }) {
      // Here you would call the function from horizonsService to get positions
      // For example:
      const positions = await getHorizonsBirthChartPositions(date, time, latitude, longitude, bodies);
      console.log(positions)
      return positions;
    },
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
