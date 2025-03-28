#!/bin/bash
# This file can only be run locally with the correct .env file in /backend/core

# Log in to Docker Hub
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

# Pull the latest images from Docker Hub
docker pull mallisho/catalog:backend-latest
docker pull mallisho/catalog:frontend-latest

# Deploy the container stack using docker-compose
docker-compose down
docker-compose up -d
