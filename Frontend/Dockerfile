# Stage 1 - Builder
FROM node:18-alpine as build

WORKDIR /app

# Only copy package files first (enables caching)
COPY package.json package-lock.json ./

# Install with clean reproducible method
RUN npm ci --frozen-lockfile

# Now copy remaining source code
COPY . .

# Build the React/Vite app
RUN npm run build

# Stage 2 - Nginx for serving static files
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
