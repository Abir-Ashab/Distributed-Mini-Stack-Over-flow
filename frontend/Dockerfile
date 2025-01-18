# Frontend Dockerfile (./frontend/Dockerfile)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run Vite dev server with host option to allow external access
CMD ["npm", "run", "dev", "--", "--host"]