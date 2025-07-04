# Stage 1: Build dependencies
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Run application
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
