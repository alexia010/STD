# Versiune simplificată care folosește node pentru a servi aplicația Angular
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Install serve for a simple static server
RUN npm install -g serve

# Expose port
EXPOSE 90

# Start a simple server on port 90
CMD ["serve", "-s", "dist/frontend/browser", "-l", "90"]
