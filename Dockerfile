# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server directory with all files
COPY server ./server

# Install dependencies and build
WORKDIR /app/server
RUN npm ci
RUN npm run build

# Clean up dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Set environment to production
ENV NODE_ENV=production

# Expose port (Railway will automatically set PORT)
EXPOSE 3001

# Start the application
CMD ["npm", "start"]