# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the backend
COPY . .

# Expose backend port
EXPOSE 4000

# Start server
CMD ["npm", "run", "dev"]
