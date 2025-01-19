# Base image
FROM node:20-alpine
RUN npm i -g pnpm

COPY . /app 

# Set working directory
WORKDIR /app
RUN pnpm install

# Copy source files
COPY . .
RUN pnpm build

# Set environment variables for Drizzle and MySQL
ENV NODE_ENV=production
CMD ["pnpm", "start:with-db"]