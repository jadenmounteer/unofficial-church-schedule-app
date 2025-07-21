#!/bin/bash

# Deploy script for The Unofficial Sunday Schedule App
echo "🚀 Starting deployment process..."
echo ""

# Build the React app
echo "📦 Building React app for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    
    # Deploy to Firebase
    echo "🔥 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    # Check if deployment was successful
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Deployment completed successfully!"
        echo "🌐 Your app is live at: https://unofficial-sunday-schedule-app.web.app"
        echo ""
    else
        echo ""
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo ""
    echo "❌ Build failed! Deployment cancelled."
    exit 1
fi 