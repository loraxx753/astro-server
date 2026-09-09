import { GraphQLError } from "graphql";
import mongoose from "mongoose";

import { connectDb } from "../../db.js";
import {
  ClientCharts,
  ensureClientChartIndexes,
  type ClientChartDocument,
  type ClientChartLocation,
} from "../../models/ClientCharts.js";

async function readyClientCharts(): Promise<void> {
  await connectDb();
  await ensureClientChartIndexes();
}

export type CreateClientChartInput = {
  name: string;
  birthDate: string;
  birthTime: string;
  location: ClientChartLocation;
  houseSystem?: string | null;
  gender?: string | null;
  notes?: string | null;
};

export type GraphqlClientChart = {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  location: {
    city: string | null;
    country: string | null;
    state: string | null;
    latitude: number;
    longitude: number;
    timezone: string | null;
  };
  houseSystem: string | null;
  gender: string | null;
  notes: string | null;
  createdAt: string;
};

function requireUserId(userId?: string): string {
  if (!userId) {
    throw new GraphQLError("Authentication required", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return userId;
}

function notFound(): never {
  throw new GraphQLError("Chart not found", {
    extensions: { code: "NOT_FOUND" },
  });
}

function asChart(doc: unknown): ClientChartDocument | null {
  return (doc ?? null) as ClientChartDocument | null;
}

function toGraphqlChart(chart: ClientChartDocument): GraphqlClientChart {
  return {
    id: String(chart._id),
    name: chart.name,
    birthDate: chart.birthDate,
    birthTime: chart.birthTime,
    location: {
      city: chart.location?.city ?? null,
      country: chart.location?.country ?? null,
      state: chart.location?.state ?? null,
      latitude: chart.location.latitude,
      longitude: chart.location.longitude,
      timezone: chart.location?.timezone ?? null,
    },
    houseSystem: chart.houseSystem ?? null,
    gender: chart.gender ?? null,
    notes: chart.notes ?? null,
    createdAt:
      chart.createdAt instanceof Date
        ? chart.createdAt.toISOString()
        : String(chart.createdAt),
  };
}

function parseObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }
  return new mongoose.Types.ObjectId(id);
}

export async function createClientChart(
  userId: string | undefined,
  input: CreateClientChartInput
): Promise<GraphqlClientChart> {
  const ownerId = requireUserId(userId);
  await readyClientCharts();
  const created = asChart(
    await ClientCharts.create({
      userId: ownerId,
      name: input.name,
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      location: input.location,
      houseSystem: input.houseSystem || "placidus",
      gender: input.gender || undefined,
      notes: input.notes || undefined,
    })
  );
  if (!created) {
    throw new GraphQLError("Could not save the chart", {
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  }
  return toGraphqlChart(created);
}

export async function listClientCharts(
  userId: string | undefined
): Promise<GraphqlClientChart[]> {
  const ownerId = requireUserId(userId);
  await readyClientCharts();
  const charts = await ClientCharts.find({ userId: ownerId })
    .sort({ createdAt: -1 })
    .lean();
  return charts.map((chart) => {
    const mapped = asChart(chart);
    if (!mapped) {
      throw new GraphQLError("Could not load saved charts", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
    return toGraphqlChart(mapped);
  });
}

export async function getClientChart(
  userId: string | undefined,
  id: string
): Promise<GraphqlClientChart> {
  const ownerId = requireUserId(userId);
  await readyClientCharts();
  const chart = asChart(
    await ClientCharts.findOne({
      _id: parseObjectId(id),
      userId: ownerId,
    }).lean()
  );
  if (!chart) {
    notFound();
  }
  return toGraphqlChart(chart);
}

export async function deleteClientChart(
  userId: string | undefined,
  id: string
): Promise<GraphqlClientChart> {
  const ownerId = requireUserId(userId);
  await readyClientCharts();
  const chart = asChart(
    await ClientCharts.findOneAndDelete({
      _id: parseObjectId(id),
      userId: ownerId,
    }).lean()
  );
  if (!chart) {
    notFound();
  }
  return toGraphqlChart(chart);
}
