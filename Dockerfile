# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./


# Install the dependencies
RUN npm install

# Copy the script.js file to the working directory
COPY Server-connector/script.js .

# Expose the port on which your Node.js application will listen
EXPOSE 3000

# Start the Node.js application
CMD ["node", "script.js"]
