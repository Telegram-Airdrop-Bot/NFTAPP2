#!/bin/bash

# NFT Verification Portal Setup Script
echo "🚀 Setting up Meta Betties NFT Verification Portal..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "📥 Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "📥 Please update Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please check the error above."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# Environment Variables for NFT Verification Portal
REACT_APP_API_URL=https://api-server-wcjc.onrender.com
EOF
    echo "✅ .env file created with default API URL"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🏗️ Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed. Please check the error above."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 To start development server:"
echo "   npm run dev"
echo ""
echo "🌐 To serve the built files:"
echo "   npm run serve:build"
echo ""
echo "📚 For more information, check README.md"
echo ""
echo "🔗 Meta Betties Community:"
echo "   Support: https://t.me/MetaBettiesSupport"
echo "   Main Group: https://t.me/bugsfixinggroup"
echo "   Private Group: https://t.me/MetaBettiesPrivateKey (NFT holders only)"
echo ""
echo "👨‍💻 Developer: @mushfiqmoon" 