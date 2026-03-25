#!/bin/bash
# Duplicate and set up a new store project
# Usage: ./duplicate_store.sh NEW_FOLDER_NAME NEW_SUPABASE_URL NEW_SUPABASE_KEY

set -e

if [ $# -ne 3 ]; then
  echo "Usage: $0 NEW_FOLDER_NAME NEW_SUPABASE_URL NEW_SUPABASE_KEY"
  exit 1
fi

SRC_DIR="$(dirname "$0")"
NEW_DIR="$SRC_DIR/$1"

# Copy project folder (excluding .next, node_modules, .git)
rsync -av --exclude='.next' --exclude='node_modules' --exclude='.git' ./ "$NEW_DIR"

# Update Supabase keys in .env.local
cat > "$NEW_DIR/.env.local" <<EOF
NEXT_PUBLIC_SUPABASE_URL=$2
NEXT_PUBLIC_SUPABASE_ANON_KEY=$3
EOF

echo "Project duplicated to $NEW_DIR."
echo "Now edit $NEW_DIR/config/brand.js for branding."
echo "Push to a new GitHub repo and deploy on Vercel."
