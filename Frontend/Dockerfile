# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx config and add custom if needed
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
