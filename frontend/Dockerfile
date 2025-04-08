FROM node:23

# Upgrade npm to the latest major version
RUN npm install -g npm@latest

# Set the working directory in the container
WORKDIR /code

# Copy the entire project directory
COPY . .

# Install Angular CLI globally
RUN npm install -g @angular/cli@17

# Install project dependencies
RUN npm install

# Expose the port Angular serves on
EXPOSE 4200

# Run the application using `ng serve`
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000", "--disable-host-check"]
