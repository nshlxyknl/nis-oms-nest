# API Testing Script for NIS-OMS Backend (PowerShell)
# This script tests all major endpoints

$BASE_URL = "http://localhost:3003"
$TOKEN = ""

Write-Host "🚀 Starting API Tests..." -ForegroundColor Green
Write-Host "========================="
Write-Host ""

# Test 1: Register a new user
Write-Host "📝 Test 1: Register a new user" -ForegroundColor Cyan
$registerBody = @{
    username = "testuser"
    password = "test123456"
    name = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Response: $($registerResponse | ConvertTo-Json -Depth 3)"
    $TOKEN = $registerResponse.access_token
    Write-Host "Token obtained successfully" -ForegroundColor Green
} catch {
    Write-Host "User may already exist, trying to login..." -ForegroundColor Yellow
}
Write-Host ""

# Test 2: Login
Write-Host "🔐 Test 2: Login" -ForegroundColor Cyan
$loginBody = @{
    username = "testuser"
    password = "test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Response: $($loginResponse | ConvertTo-Json -Depth 3)"
    $TOKEN = $loginResponse.access_token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Create headers with token
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Test 3: Get current user profile
Write-Host "👤 Test 3: Get user profile (GET /auth/me)" -ForegroundColor Cyan
try {
    $profile = Invoke-RestMethod -Uri "$BASE_URL/auth/me" -Method Get -Headers $headers
    Write-Host "$($profile | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get employees
Write-Host "👥 Test 4: Get employees (GET /employees)" -ForegroundColor Cyan
try {
    $employees = Invoke-RestMethod -Uri "$BASE_URL/employees" -Method Get -Headers $headers
    Write-Host "$($employees | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get leaves
Write-Host "📅 Test 5: Get leaves (GET /leaves)" -ForegroundColor Cyan
try {
    $leaves = Invoke-RestMethod -Uri "$BASE_URL/leaves" -Method Get -Headers $headers
    Write-Host "$($leaves | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get rooms
Write-Host "🏢 Test 6: Get rooms (GET /rooms)" -ForegroundColor Cyan
try {
    $rooms = Invoke-RestMethod -Uri "$BASE_URL/rooms" -Method Get -Headers $headers
    Write-Host "$($rooms | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get room bookings
Write-Host "📆 Test 7: Get room bookings (GET /room-bookings)" -ForegroundColor Cyan
try {
    $bookings = Invoke-RestMethod -Uri "$BASE_URL/room-bookings" -Method Get -Headers $headers
    Write-Host "$($bookings | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Get assets
Write-Host "💼 Test 8: Get assets (GET /assets)" -ForegroundColor Cyan
try {
    $assets = Invoke-RestMethod -Uri "$BASE_URL/assets" -Method Get -Headers $headers
    Write-Host "$($assets | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 9: Get asset requests
Write-Host "📋 Test 9: Get asset requests (GET /asset-requests)" -ForegroundColor Cyan
try {
    $assetRequests = Invoke-RestMethod -Uri "$BASE_URL/asset-requests" -Method Get -Headers $headers
    Write-Host "$($assetRequests | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 10: Get notices
Write-Host "📢 Test 10: Get notices (GET /notices)" -ForegroundColor Cyan
try {
    $notices = Invoke-RestMethod -Uri "$BASE_URL/notices" -Method Get -Headers $headers
    Write-Host "$($notices | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=========================" -ForegroundColor Green
Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To test with your frontend:" -ForegroundColor Yellow
Write-Host "1. Make sure backend is running: npm run start:dev" -ForegroundColor White
Write-Host "2. Make sure frontend has NEXT_PUBLIC_API_URL=http://localhost:3003" -ForegroundColor White
Write-Host "3. Start your frontend and try to login" -ForegroundColor White
