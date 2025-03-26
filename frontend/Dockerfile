# Node image used
FROM node:latest

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port and run the application
EXPOSE 3000
CMD ["npm", "run"]
