#!/bin/bash

# Motion MCP Server Quick Installer
# This script helps you quickly set up the Motion MCP server

set -e

echo "🚀 Motion MCP Server Quick Setup"
echo "================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

# Install the package globally
echo "📦 Installing Motion MCP Server..."
npm install -g @h3ro-dev/motion-mcp-server

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Get your Motion API key:"
echo "   https://app.usemotion.com → Settings → API & Integrations"
echo ""
echo "2. Add to your AI assistant config:"
echo ""
echo "   For Claude Desktop (macOS):"
echo "   ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "   Add this configuration:"
echo '   {
     "mcpServers": {
       "motion": {
         "command": "npx",
         "args": ["-y", "@h3ro-dev/motion-mcp-server"],
         "env": {
           "MOTION_API_KEY": "your-api-key-here"
         }
       }
     }
   }'
echo ""
echo "3. Restart your AI assistant"
echo ""
echo "🎉 You're all set! Try: 'List my Motion tasks'"