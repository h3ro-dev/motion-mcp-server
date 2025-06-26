#!/bin/bash

# Update git remote after transferring to Utlyze
echo "Updating git remote to Utlyze organization..."

# Remove old remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/Utlyze/motion-mcp-server.git

# Verify the change
echo "New remote configuration:"
git remote -v

echo ""
echo "✅ Remote updated to Utlyze organization!"
echo ""
echo "Next steps:"
echo "1. Update package.json repository URLs"
echo "2. Update README.md GitHub links"
echo "3. Update npm package scope if needed"