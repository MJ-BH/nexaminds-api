# 1. Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install devDependencies (typescript is needed here)
RUN npm install 
COPY . .
# Run the TypeScript Compiler
RUN npm run build

# 2. Production Stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --production
# Copy the compiled JS from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the correct port (CHANGE THIS PER SERVICE: 3001, 3002, 3003, 3000)
EXPOSE 3001

# Run the compiled JS
CMD ["node", "dist/index.js"]