# Multi-stage build for Railway deployment
FROM node:18-alpine AS base

# Build stage for client
FROM base AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Build stage for server
FROM base AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy server build and dependencies
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/package*.json ./

# Copy client build to serve static files
COPY --from=client-builder /app/client/dist ./public

# Create necessary directories
RUN mkdir -p projects uploads

# Expose port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]