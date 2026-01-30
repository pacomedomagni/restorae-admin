# =============================================================================
# Build Stage
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Build args for Next.js build-time environment
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# =============================================================================
# Production Stage
# =============================================================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (need next for runtime)
RUN npm ci && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port (3002 to avoid conflicts with Loni)
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002 || exit 1

# Use dumb-init to handle PID 1 and signal handling properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application on port 3002
CMD ["npm", "start", "--", "-p", "3002"]
