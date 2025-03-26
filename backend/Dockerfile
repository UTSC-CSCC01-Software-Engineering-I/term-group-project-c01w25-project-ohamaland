# Python image used
FROM python:latest

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port and run the application
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]