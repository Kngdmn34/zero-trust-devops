FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 nextjs

# Prepare directories
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

COPY --chown=nextjs:nodejs frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY --chown=nextjs:nodejs . .
RUN cd frontend && npm run build

EXPOSE 3000
CMD ["npm", "start", "--prefix", "frontend"]
