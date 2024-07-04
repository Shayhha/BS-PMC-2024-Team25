# Use the official Python base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /bugFixer

# Copy the current directory contents into the container at /bugFixer
COPY . /bugFixer

# Install pytest
RUN pip install pytest

# Command to run pytest
CMD ["pytest", "-s"]