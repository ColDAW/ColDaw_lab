# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install bash (Alpine doesn't have bash by default)
RUN apk add --no-cache bash

# Copy package files
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN npm run install:server

# Copy all source code
COPY . .

# Build the server
RUN cd server && npm run build

# Expose port (Railway will set PORT environment variable)
EXPOSE ${PORT:-3001}

# Set environment to production
ENV NODE_ENV=production

# Start the server directly (not using start.sh for production)
CMD ["npm", "run", "start"]