#!/bin/bash

# Motion MCP Server Test Setup Script
set -e

echo "🧪 Motion MCP Server Test Setup"
echo "================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install dev dependencies if not already installed
echo "📦 Installing test dependencies..."
npm install --save-dev jest ts-jest @types/jest @jest/globals

echo ""
echo "🏃 Running tests..."
echo ""

# Run different test suites
echo "1️⃣ Running unit tests..."
npm run test:unit

echo ""
echo "2️⃣ Running integration tests..."
npm run test:integration

echo ""
echo "3️⃣ Running test coverage..."
npm run test:coverage

echo ""
echo "✅ Test setup complete!"
echo ""
echo "📋 Available test commands:"
echo "  npm test              - Run all tests"
echo "  npm run test:watch    - Run tests in watch mode"
echo "  npm run test:coverage - Run tests with coverage report"
echo "  npm run test:unit     - Run unit tests only"
echo "  npm run test:integration - Run integration tests only"
echo "  npm run test:e2e      - Run end-to-end tests (requires real API key)"
echo ""
echo "💡 To run E2E tests with real Motion API:"
echo "  export MOTION_API_KEY='your-real-api-key'"
echo "  npm run test:e2e"