# The CI/CD Pipeline Documentation

## **1. Introduction**

This document outlines the CI/CD pipeline for the project, utilizing **GitHub Actions** for automation and **Docker** for containerized application deployment. The pipeline automates the building, testing, and deployment of both the backend and frontend services.

## **2. Workflow**

This CI/CD pipeline consists of the following key stages:

### **Continuous Integration (CI)**

1. **Code Checkout**: Pulls the latest changes from the Git repository.
2. **Docker Hub Authentication**: Logs into Docker Hub using secure credentials.
3. **Build Docker Images**: Creates images for the backend and frontend services.
4. **Run Tests**: If tests pass, the images pushed to Docker Hub.
5. **Push to Docker Hub**: Uploads successfully built and tested images to Docker Hub for deployment.

### **Continuous Deployment (CD)**

1. **Code Checkout**: Pulls the latest changes from the Git repository.
2. **Docker Hub Authentication**: Logs into Docker Hub using secure credentials.
3. **Pull Latest Images**: Retrieves the latest backend and frontend images from Docker Hub.
4. **Deploy Containers**: Uses Docker Compose to start the services.

## **3. CI/CD Workflow Implementation**

### **3.1. CI Pipeline**
The CI pipeline is located in `.github/workflows/ci.yml` and triggers on any push or pull request to the `main` branch. The CI steps are as follows:

1. **Check Out Repository**:
   ```yaml
   - name: Check out repository
     uses: actions/checkout@v4
   ```

2. **Log In to Docker Hub**:
   ```yaml
   - name: Log in to Docker Hub
     run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
   ```

3. **Build and Push Backend & Frontend Docker Images - Push After Successful Testing**:
   ```yaml
   - name: Build backend Docker image
     run: docker build -t mallisho/catalog:backend-latest ./backend
   
   - name: Build frontend Docker image
     run: docker build -t mallisho/catalog:frontend-latest ./frontend
   
   - name: Push backend image
     run: docker push mallisho/catalog:backend-latest
   
   - name: Push frontend image
     run: docker push mallisho/catalog:frontend-latest
   ```

### **3.2. CD Pipeline**
The CD pipeline is located in `.github/workflows/cd.yml` and triggers on any push to the `main` branch. The CD steps are as follows:

1. **Check Out Repository**:
   ```yaml
   - name: Check out the repository
     uses: actions/checkout@v4
   ```

2. **Log In to Docker Hub**:
   ```yaml
   - name: Log in to Docker Hub
     run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
   ```

3. **Pull and Deploy Containers**:
   ```yaml
   - name: Pull latest images
     run: |
       docker pull mallisho/catalog:backend-latest
       docker pull mallisho/catalog:frontend-latest

   - name: Stop and remove old containers
     run: docker-compose down
   
   - name: Start containers
     run: docker-compose up -d
   ```

## **4. Configuration Files**

The `docker-compose.yml` file defines the multi-container setup (We have images for the Database, Backend, and Frontend):

```yaml
services:
  backend:
    image: mallisho/catalog:backend-latest
    ports:
      - "8000:8000"
    env_file:
      - ./backend/core/.env
    depends_on:
      - db

  frontend:
    image: mallisho/catalog:frontend-latest
    ports:
      - "3000:3000"
    depends_on:
      - backend

  db:
    image: postgres:latest
    env_file:
      - ./backend/core/.env
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## **5. Deployment Script for Quick Local Dev Testing**

For local testing or deployment, use the `deploy-dev.sh` script to automate the process of logging into Docker Hub, pulling the latest images, and deploying them with Docker Compose:

```bash
#!/bin/bash

# Log in to Docker Hub
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

# Pull the latest images from Docker Hub
docker pull mallisho/catalog:backend-latest
docker pull mallisho/catalog:frontend-latest

# Deploy the container stack using docker-compose
docker-compose down
docker-compose up -d
```

Run this script locally to deploy or test the application without triggering the full CI/CD pipeline.

## **6. Troubleshooting**

| **Issue**                  | **Possible Cause**          | **Solution**                                                        |
|----------------------------|-----------------------------|---------------------------------------------------------------------|
| Docker login fails          | Incorrect credentials       | Verify Docker Hub credentials in GitHub Secrets.                    |
| Container does not start    | Missing environment variables | Ensure `.env` files are correctly configured for the services.      |
| Docker images not updated   | Cache issues in Docker      | Run `docker-compose up -d --build` to rebuild images.               |

## **7. Conclusion**

- This CI/CD pipeline automates the build, testing, and deployment processes for both the backend and frontend services, ensuring consistent and reliable delivery. The system is designed to be flexible, and future improvements will enhance its scalability and robustness.

Finally, Some Things to Note:
- **Sequential Image Build**: Database, Backend, frontend images are built sequentially to ensure the correct dependencies are respected.

- **Testing**: Tests for backend and frontend are currently included as placeholders and can be enabled or customized as needed.

- **Conditional Deployment**: Deployment to production (or staging) only occurs if the CI process completes successfully, ensuring that only tested and valid code is deployed.
