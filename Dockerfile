# Stage 1: Dependency Installation & Caching
# Uses a lightweight Node.js base image for building.
FROM public.ecr.aws/docker/library/node:20-alpine AS deps
WORKDIR /app

# Install dependencies based on your package.json and package-lock.json
# This layer is cached efficiently.
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Stage 2: Build the Next.js Application
# This stage uses the installed dependencies to build your Next.js app.
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
# `npm run build` command is assumed based on Next.js default setup.
# Adjust if your build script is different.
RUN npm run build

# Stage 3: Final Production Image (Runtime)
# This is the smallest image, containing only what's needed to run the app.
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

# Set environment variables for production
#ENV NODE_ENV=production

# Copy necessary build artifacts from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# If you're using standalone output, the .next folder structure might differ slightly.
# Next.js 13+ App Router often defaults to standalone output, which is great for Docker.
# Make sure your next.config.js has:
# output: 'standalone',

# Expose the port Next.js listens on (default is 3000)
EXPOSE 3000

# Command to run the Next.js application
RUN ls -laR
CMD ["npm", "run", "dev"]
