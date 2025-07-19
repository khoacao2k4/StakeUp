# Stage 1: Build the application
# Use an official Node.js image. 'alpine' is a lightweight version.
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's layer caching.
# This step will only re-run if these files change.
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Run the build script to compile TypeScript into JavaScript (creates the 'dist' folder)
RUN npm run build


# Stage 2: Create the final, production-ready image
# Use a slim image for a smaller final size
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the 'builder' stage
COPY package*.json ./

# Install ONLY production dependencies to keep the image small
RUN npm install --production

# Copy the compiled JavaScript code from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Expose the port your app will run on inside the container
EXPOSE 3000

# The command to run your application
CMD ["npm", "start"]