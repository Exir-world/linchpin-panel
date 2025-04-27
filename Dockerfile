# Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy all files
COPY . .

# Build Next.js app
RUN npm run build

# Production Stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --only=production

# Copy built app from builder
COPY --from=builder /app/.next .next

# Only copy the public folder if it exists
RUN test -d /app/public && cp -R /app/public /app/public || echo "No public folder found"

# Copy other necessary files
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

# Expose port (you can change this if needed)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]
