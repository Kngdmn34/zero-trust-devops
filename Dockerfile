FROM node:18-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 nextjs

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY --chown=nextjs:nodejs . .
RUN cd frontend && npm run build
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000
CMD ["npm", "start", "--prefix", "frontend"]