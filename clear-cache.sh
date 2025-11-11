#!/bin/bash

echo "🧹 Clearing Next.js cache..."

# Remove .next directory
rm -rf .next

# Remove node_modules/.cache if it exists
rm -rf node_modules/.cache

echo "✅ Cache cleared successfully!"
echo "Now run: npm run dev (for local) or git push (for Vercel)"
