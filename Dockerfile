# ---- Build stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies (leverage layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine AS runtime

# Replace default nginx config with our tuned one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
