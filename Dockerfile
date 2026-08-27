# Swiss Ephemeris compiles with node-gyp@8, which still imports Python distutils.
# Railway Railpack's default Python is 3.13 (no distutils). Debian Bookworm's
# python3 is 3.11, which still has it. A Dockerfile also bypasses Railpack.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 7004

# Use the local tsx loader. npx can hang/fail at runtime, and a Railway
# dashboard start command of `yarn start` would miss Yarn in this image.
CMD ["node", "--import", "tsx", "src/index.ts"]
