# Frontend Dockerfile
# Use a lightweight Node.js image for building
FROM node:18-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the frontend
RUN npm run build

# Use a lightweight server to serve the built files
FROM nginx:stable-alpine

# Copy the built files to Nginx's default directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
