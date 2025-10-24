import { gql } from 'apollo-server';

export const typeDefs = gql`
type ClientChart {
  id: ID!
  name: String!
  birthDate: String!
  birthTime: String!
  location: Location!
  chartData: JSON!
  createdAt: String!
}

type Location {
  city: String
  country: String
  state: String
  latitude: Float!
  longitude: Float!
  timezone: String
}

scalar JSON

type Query {
  birthChart(id: ID!): ClientChart
  birthCharts: [ClientChart!]
}

type Mutation {
  createClientChart(
    name: String!
    birthDate: String!
    birthTime: String!
    location: LocationInput!
    chartData: JSON!
  ): ClientChart
  deleteClientChart(id: ID!): ClientChart
}

input LocationInput {
  city: String
  country: String
  state: String
  latitude: Float!
  longitude: Float!
  timezone: String
}

type BirthChartReading {
    id: ID!
    name: String!
}

type Reading {
    sunSign: CelestialBodyPosition!
    moonSign: CelestialBodyPosition!
    celestialBodyPositions: [CelestialBodyPosition!]!
}

type House {
    houseNumber: Int!
    sign: String!
    cusp: DegreeDetail!
}

type Sign {
    name: String!
    element: String!
    modality: String!
    rulingPlanet: String!
}

type DegreeDetail {
    decimal: Float!,
    degrees: Degree!,
}

type Degree {
    whole: Int!
    minutes: Int!
    seconds: Int!
    decimal: Float!
}

type CelestialBodyPosition {
    name: String!
    sign: String!
    latitude: DegreeDetail!
    longitude: DegreeDetail!
}
`;