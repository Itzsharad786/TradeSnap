#!/bin/bash

# Quick Deploy Script for Tradesnap
# Run: bash deploy.sh

echo "🚀 Tradesnap Deployment Script"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found!"
    echo "Creating from template..."
    cp .env.production.example .env.production
    echo "✅ Created .env.production - Please edit and add your API keys!"
    echo ""
    read -p "Press Enter when ready to continue (or Ctrl+C to cancel)..."
fi

echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    
    read -p "Deploy to Firebase? (y/n): " response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying to Firebase Hosting..."
        firebase deploy --only hosting
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 Deployment successful!"
            echo "Your app is live at: https://tradesnapai.web.app"
        else
            echo ""
            echo "❌ Deployment failed!"
            echo "Make sure you're logged in: firebase login"
        fi
    else
        echo "Deployment cancelled."
    fi
else
    echo ""
    echo "❌ Build failed! Fix errors and try again."
fi
