# Build stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g serve

COPY . .

# Build the application
RUN npm run build

EXPOSE 4200

# Start a simple server on port 4200
CMD ["serve", "-s", "dist/frontend/browser", "-l", "4200"]


# # Build stage
# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install
# RUN npm install -g @angular/cli

# COPY . .

# # Build with environment variable
# ARG API_URL
# RUN ng build --configuration production --aot --output-path=/usr/share/nginx/html --base-href=/ --deploy-url=/ --configuration=production --environment=production --env=production --env.production=true --env.production.apiUrl=${API_URL}

# EXPOSE 4200

# CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
