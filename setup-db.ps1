# PostgreSQL Database Setup Script for AI UI Builder
# This script creates the database and user

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AI UI Builder - Database Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$PSQL_PATH = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# Check if psql exists
if (-not (Test-Path $PSQL_PATH)) {
    Write-Host "ERROR: PostgreSQL not found at $PSQL_PATH" -ForegroundColor Red
    Write-Host "Please update the PSQL_PATH variable in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Creating database and user..." -ForegroundColor Green
Write-Host "You will be prompted for the PostgreSQL postgres user password." -ForegroundColor Yellow
Write-Host ""

# Run the SQL script
& $PSQL_PATH -U postgres -f setup-database.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "Database setup complete!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database Details:" -ForegroundColor Cyan
    Write-Host "  Database Name: ai_ui_builder" -ForegroundColor White
    Write-Host "  Username: aibuilder" -ForegroundColor White
    Write-Host "  Password: aibuilder_secure_2024" -ForegroundColor White
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 5432" -ForegroundColor White
    Write-Host ""
    Write-Host "Your DATABASE_URL should be:" -ForegroundColor Cyan
    Write-Host "postgresql://aibuilder:aibuilder_secure_2024@localhost:5432/ai_ui_builder?schema=public" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Update your .env file with the DATABASE_URL above" -ForegroundColor White
    Write-Host "2. Run: npx prisma generate" -ForegroundColor White
    Write-Host "3. Run: npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "Database setup failed!" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Wrong postgres password" -ForegroundColor White
    Write-Host "2. PostgreSQL service not running" -ForegroundColor White
    Write-Host "3. Database already exists" -ForegroundColor White
    Write-Host ""
}
