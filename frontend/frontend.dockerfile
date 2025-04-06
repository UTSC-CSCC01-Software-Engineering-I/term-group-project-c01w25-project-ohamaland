FROM --platform=linux/amd64 node:lts-slim as build

RUN mkdir -p /app
WORKDIR /app

# Copy all files from the current directory (the context) into the image
COPY . /app

RUN NODE_ENV=development npm i

# Copy the entire project to the container
COPY . .

# Build the Next.js application for production
RUN npm run build


FROM --platform=linux/amd64 node:lts-slim as main
WORKDIR /app

# Copy all files from the build stage into the main stage
COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "run", "start"]