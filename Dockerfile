# Base image for Node.js
FROM node:18

# Install dependencies for running Ollama (if needed, adjust package manager for your system)
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*
    
RUN curl -fsSL https://ollama.com/install.sh | sh && \
    ollama pull llama3.2

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to start the Node.js application
CMD ["node", "app.js"]
