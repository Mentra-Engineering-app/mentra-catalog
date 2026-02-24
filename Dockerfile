FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port (Next.js default is 3000)
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
