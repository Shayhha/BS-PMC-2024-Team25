# Use the official Python base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /server

# Copy the current directory contents into the container at /server
COPY . .

# Install pytest
RUN pip install -r requirements.txt
EXPOSE 8090

# Command to run pytest
CMD ["pytest", "-s", "test_main.py"]