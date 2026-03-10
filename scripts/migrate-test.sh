#!/bin/bash
set -e

# Load .env file
export $(grep -v '^#' .env | xargs)

# Create the test database if it doesn't exist
DB_NAME=$(echo $TEST_DATABASE_URL | sed 's/.*\///')
psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "ℹ️  Database '$DB_NAME' already exists, skipping creation"

# Run migration using TEST_DATABASE_URL as DATABASE_URL
DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy

echo "✅ Test database migrated successfully"