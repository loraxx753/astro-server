import { ClientCharts, IClientChart } from './models/ClientCharts';

export const resolvers = {
  Query: {
    async birthChart(_: any, { id }: { id: string }) {
      return await ClientCharts.findById(id);
    },
    async birthCharts() {
      return await ClientCharts.find();
    },
  },
  Mutation: {
    async createClientChart(_: any, input: IClientChart) {
      const chart = new ClientCharts(input);
      await chart.save();
      return chart;
    },
    async deleteClientChart(_: any, { id }: { id: string }) {
      return await ClientCharts.findByIdAndDelete(id);
    },
  },
};
