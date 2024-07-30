# Use the official Python base image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    gnupg \
    unixodbc \
    unixodbc-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add Microsoft repository and install ODBC driver
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Set the working directory
WORKDIR /server

# Copy the current directory contents into the container at /server
COPY . .

# Install pytest
# Install Python dependencies
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt

EXPOSE 8090

# Command to run pytest
CMD ["pytest", "-s", "test_main.py"]