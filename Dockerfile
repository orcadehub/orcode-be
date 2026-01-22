FROM node:18

# Install Docker
RUN apt-get update && apt-get install -y docker.io

# Copy backend files
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Start both Piston and Node.js
CMD ["sh", "-c", "cd piston && docker-compose up -d && cd .. && npm start"]