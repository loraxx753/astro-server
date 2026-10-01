FROM node:26-slim

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
