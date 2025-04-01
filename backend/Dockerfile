FROM python:3.12

# Set environment variables for better performance and debugging
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /code

# Install system tools (e.g., netcat for debugging)
RUN apt-get update && apt-get install -y netcat-openbsd

# Create and activate a virtual environment for Python
RUN python -m venv /venv
# Set the PATH variable to use the virtual environment's Python and pip
ENV PATH="/venv/bin:$PATH"

# Copy the backend code into the container
COPY . . 

# Install dependencies inside the virtual environment
RUN pip install --no-cache-dir -r requirements.txt

# Install the package in editable mode
RUN pip install -e .

# Copy the entrypoint script and grant execution permissions
COPY entrypoint.sh /code/
RUN chmod +x /code/entrypoint.sh

# Set the entrypoint script as the default entrypoint
ENTRYPOINT ["/code/entrypoint.sh"]
