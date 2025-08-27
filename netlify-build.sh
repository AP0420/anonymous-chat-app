#!/bin/bash
# netlify-build.sh
# This script runs during Netlify's build process.

echo "Starting build process..."

CONFIG_DIR="public"
CONFIG_FILE="$CONFIG_DIR/config.js"
PROD_CONFIG_FILE="$CONFIG_DIR/config.production.js"

# Ensure public directory exists
mkdir -p "$CONFIG_DIR"

if [ -f "$PROD_CONFIG_FILE" ]; then
    # Copy production config
    cp "$PROD_CONFIG_FILE" "$CONFIG_FILE"
    echo "Production configuration file copied!"
else
    # Create a new config.js if production config doesn't exist
    BACKEND_URL=${CHAT_SERVER_URL:-"https://your-default-backend.com"}
    echo "window.CHAT_SERVER_URL = \"$BACKEND_URL\";" > "$CONFIG_FILE"
    echo "Config file created with backend URL."
fi

# Show which backend URL is being used
if [ -f "$CONFIG_FILE" ]; then
    echo "Using backend URL: $(grep -o 'https://[^\";]*' $CONFIG_FILE)"
else
    echo "Error: config.js not found!"
    exit 1
fi
#!/bin/bash
# netlify-build.sh
# This script runs during Netlify's build process.

echo "Starting build process..."

CONFIG_DIR="public"
CONFIG_FILE="$CONFIG_DIR/config.js"
PROD_CONFIG_FILE="$CONFIG_DIR/config.production.js"

# Ensure public directory exists
mkdir -p "$CONFIG_DIR"

if [ -f "$PROD_CONFIG_FILE" ]; then
    # Copy production config
    cp "$PROD_CONFIG_FILE" "$CONFIG_FILE"
    echo "Production configuration file copied!"
else
    # Create a new config.js if production config doesn't exist
    BACKEND_URL=${CHAT_SERVER_URL:-"https://your-default-backend.com"}
    echo "window.CHAT_SERVER_URL = \"$BACKEND_URL\";" > "$CONFIG_FILE"
    echo "Config file created with backend URL."
fi

# Show which backend URL is being used
if [ -f "$CONFIG_FILE" ]; then
    echo "Using backend URL: $(grep -o 'https://[^\";]*' $CONFIG_FILE)"
else
    echo "Error: config.js not found!"
    exit 1
fi
