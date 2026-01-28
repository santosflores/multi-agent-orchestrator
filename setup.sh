#!/bin/bash
set -e

echo "🚀 Initializing Agentic App Boilerplate..."

# Function to setup directory
setup_directory() {
    local dir=$1
    echo "📦 Setting up $dir..."
    
    if [ -d "$dir" ]; then
        cd $dir
        
        # Handle .env
        if [ ! -f .env ]; then
            if [ -f .env.template ]; then
                echo "📝 Creating .env from template in $dir..."
                cp .env.template .env
            else
                echo "⚠️ No .env.template found in $dir"
            fi
        else
            echo "✅ .env already exists in $dir"
        fi
        
        # Install dependencies
        if [ -f package.json ]; then
            echo "📥 Installing dependencies in $dir..."
            npm install
        fi
        
        cd ..
    else
        echo "❌ Directory $dir not found!"
    fi
}

setup_directory "backend"
setup_directory "frontend"

echo "🎉 Setup complete! You can now run:"
echo "  make dev-backend"
echo "  make dev-frontend"
