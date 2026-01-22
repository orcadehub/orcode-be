#!/bin/bash

echo "🚀 Starting Piston development instance..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start Piston container
docker-compose up -d

# Wait for Piston to be ready
echo "⏳ Waiting for Piston to start..."
sleep 15

# Check if Piston is healthy
if curl -f http://localhost:2000/api/v2/runtimes > /dev/null 2>&1; then
    echo "✅ Piston is running at http://localhost:2000"
    echo "📋 Available runtimes:"
    curl -s http://localhost:2000/api/v2/runtimes | python3 -m json.tool | grep '"language"' | cut -d'"' -f4 | sort | uniq
    echo ""
    echo "🎯 Your backend can now use unlimited code execution!"
    echo "💡 Start your backend with: cd ../ && npm start"
else
    echo "❌ Piston failed to start properly"
    echo "📋 Container logs:"
    docker-compose logs piston
    exit 1
fi