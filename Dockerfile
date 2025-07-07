# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json if it exists
COPY package*.json ./

# Use npm install instead of npm ci if lock file might be missing
RUN npm install

# Copy the rest of your code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./

# Use npm install instead of ci to avoid lockfile errors
RUN npm install --omit=dev

# Copy the built app and other necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Clean up
RUN npm cache clean --force

# Add a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 49000
CMD ["node", "dist/index.js"]
