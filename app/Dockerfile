# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory to /workspace
WORKDIR /workspace

# Copy requirements.txt from context (./app)
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents (./app) into the container at /workspace/app
COPY . ./app

# Set PYTHONPATH to /workspace so "import app.main" works
ENV PYTHONPATH=/workspace

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run app.main:app when the container launches
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
