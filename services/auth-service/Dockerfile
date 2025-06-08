FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set executable permission for start script
RUN chmod +x src/index.js

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/attendance?schema=auth"
ENV JWT_SECRET="your-secret-key-for-development-change-in-production" 
ENV JWT_EXPIRATION="1d"

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/index.js"] 