# Database Setup Script for AI UI Builder SaaS (PowerShell)
# This script sets up the PostgreSQL database and runs initial migrations

$ErrorActionPreference = "Stop"

Write-Host "🚀 AI UI Builder - Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/compose/install/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created. Please update it with your configuration." -ForegroundColor Green
}

# Start PostgreSQL container
Write-Host "🐘 Starting PostgreSQL container..." -ForegroundColor Cyan
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if PostgreSQL is healthy
$maxRetries = 30
$retryCount = 0
$isReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        $result = docker-compose exec -T postgres pg_isready -U user -d ai_ui_builder 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
            $isReady = $true
            break
        }
    } catch {
        # Continue waiting
    }
    
    $retryCount++
    Write-Host "   Waiting... ($retryCount/$maxRetries)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if (-not $isReady) {
    Write-Host "❌ PostgreSQL failed to start. Check logs with: docker-compose logs postgres" -ForegroundColor Red
    exit 1
}

# Run Prisma migrations
Write-Host ""
Write-Host "📦 Running Prisma migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init

# Generate Prisma Client
Write-Host ""
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Success message
Write-Host ""
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update your .env file with any custom configuration"
Write-Host "  2. Run 'npm run dev' to start the development server"
Write-Host "  3. Visit http://localhost:3000 to see your app"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  - View database: npx prisma studio"
Write-Host "  - Stop database: docker-compose down"
Write-Host "  - View logs: docker-compose logs postgres"
Write-Host ""
