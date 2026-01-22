#!/bin/bash

echo "Deploying Piston production instance..."

# Production environment check
if [ "$NODE_ENV" != "production" ]; then
    echo "Warning: NODE_ENV is not set to production"
fi

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Pull latest image
docker pull ghcr.io/engineer-man/piston:latest

# Start production container
docker-compose -f docker-compose.prod.yml up -d

# Wait for startup
echo "Waiting for Piston to initialize..."
sleep 15

# Health check
if curl -f http://localhost:2000/api/v2/runtimes > /dev/null 2>&1; then
    echo "✅ Piston production instance is running"
    
    # Install common packages
    echo "Installing language packages..."
    docker exec piston_production piston ppman install python=3.10.0
    docker exec piston_production piston ppman install node=18.15.0
    docker exec piston_production piston ppman install java=15.0.2
    docker exec piston_production piston ppman install gcc=10.2.0
    
    echo "🚀 Production deployment complete!"
else
    echo "❌ Production deployment failed"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi