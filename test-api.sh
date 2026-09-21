#!/bin/bash

# API Testing Script for NIS-OMS Backend
# This script tests all major endpoints

BASE_URL="http://localhost:3003"
TOKEN=""

echo "🚀 Starting API Tests..."
echo "========================="
echo ""

# Test 1: Register a new user
echo "📝 Test 1: Register a new user"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456",
    "name": "Test User"
  }')

echo "Response: $REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# Test 2: Login
echo "🔐 Test 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456"
  }')

echo "Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo ""

# Test 3: Get current user profile
echo "👤 Test 3: Get user profile (GET /auth/me)"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 4: Get employees
echo "👥 Test 4: Get employees (GET /employees)"
curl -s -X GET "$BASE_URL/employees" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 5: Get leaves
echo "📅 Test 5: Get leaves (GET /leaves)"
curl -s -X GET "$BASE_URL/leaves" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 6: Get rooms
echo "🏢 Test 6: Get rooms (GET /rooms)"
curl -s -X GET "$BASE_URL/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 7: Get room bookings
echo "📆 Test 7: Get room bookings (GET /room-bookings)"
curl -s -X GET "$BASE_URL/room-bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 8: Get assets
echo "💼 Test 8: Get assets (GET /assets)"
curl -s -X GET "$BASE_URL/assets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 9: Get asset requests
echo "📋 Test 9: Get asset requests (GET /asset-requests)"
curl -s -X GET "$BASE_URL/asset-requests" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 10: Get notices
echo "📢 Test 10: Get notices (GET /notices)"
curl -s -X GET "$BASE_URL/notices" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""

echo "========================="
echo "✅ All tests completed!"
echo ""
echo "To test with your frontend:"
echo "1. Make sure backend is running: npm run start:dev"
echo "2. Make sure frontend has NEXT_PUBLIC_API_URL=http://localhost:3003"
echo "3. Start your frontend and try to login"
