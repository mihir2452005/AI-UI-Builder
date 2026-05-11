#!/bin/bash

# Database Setup Script for AI UI Builder SaaS
# This script sets up the PostgreSQL database and runs initial migrations

set -e

echo "🚀 AI UI Builder - Database Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Start PostgreSQL container
echo "🐘 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is healthy
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose exec -T postgres pg_isready -U user -d ai_ui_builder > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ PostgreSQL failed to start. Check logs with: docker-compose logs postgres"
    exit 1
fi

# Run Prisma migrations
echo ""
echo "📦 Running Prisma migrations..."
npx prisma migrate dev --name init

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Success message
echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update your .env file with any custom configuration"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Visit http://localhost:3000 to see your app"
echo ""
echo "Useful commands:"
echo "  - View database: npx prisma studio"
echo "  - Stop database: docker-compose down"
echo "  - View logs: docker-compose logs postgres"
echo ""
