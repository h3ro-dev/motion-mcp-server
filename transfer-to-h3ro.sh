#!/bin/bash

# Script to update Motion MCP Server after transfer to h3ro-dev

echo "📦 Updating Motion MCP Server for h3ro-dev organization..."

# Update package.json
echo "1. Updating package.json..."
sed -i '' 's|"name": "@h3ro-dev/motion-mcp-server"|"name": "@h3ro-dev/motion-mcp-server"|g' package.json
sed -i '' 's|https://github.com/CryptoJym/motion-mcp-server|https://github.com/h3ro-dev/motion-mcp-server|g' package.json

# Update README.md
echo "2. Updating README.md..."
sed -i '' 's|https://github.com/CryptoJym/motion-mcp-server|https://github.com/h3ro-dev/motion-mcp-server|g' README.md

# Update mcp.json
echo "3. Updating mcp.json..."
sed -i '' 's|https://github.com/CryptoJym/motion-mcp-server|https://github.com/h3ro-dev/motion-mcp-server|g' mcp.json

# Update git remote
echo "4. Updating git remote..."
git remote set-url origin https://github.com/h3ro-dev/motion-mcp-server.git

# Show new remote
echo ""
echo "✅ Updates complete! New remote:"
git remote -v

echo ""
echo "Next steps:"
echo "1. Transfer repo on GitHub: Settings → Transfer ownership → h3ro-dev"
echo "2. After transfer, run: git push"
echo "3. Update npm publish scope if needed"