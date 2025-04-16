#!/bin/bash

# Navigate to the backend directory (adjust based on your folder structure)
cd "$(dirname "$0")/.."

# Path to backend/.env (direct path as specified)
ENV_PATH="$(pwd)/backend/.env"

# Check if the .env file exists
if [ ! -f "$ENV_PATH" ]; then
  echo "Error: backend/.env not found at $ENV_PATH"
  exit 1
fi

# Load environment variables from .env
echo "Loading environment variables from backend/.env"
set -o allexport
source "$ENV_PATH"
set +o allexport

# Confirm environment variables
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# Create a temporary MySQL config file to avoid password prompt
TMP_MY_CNF=$(mktemp)
chmod 600 "$TMP_MY_CNF"

cat > "$TMP_MY_CNF" <<EOF
[client]
user=$DB_USER
password=$DB_PASSWORD
host=${DB_HOST:-localhost}
EOF

MYSQL_CMD="mysql --defaults-extra-file=$TMP_MY_CNF"

# Create the database if it doesn't exist
echo "Checking if the database $DB_NAME exists..."
DB_EXISTS=$(mysql --defaults-extra-file=$TMP_MY_CNF -e "SHOW DATABASES LIKE '$DB_NAME';" | grep "$DB_NAME" > /dev/null; echo "$?")

if [ "$DB_EXISTS" -ne 0 ]; then
  echo "Database $DB_NAME does not exist. Creating it now..."
  $MYSQL_CMD -e "CREATE DATABASE $DB_NAME;"
else
  echo "Database $DB_NAME already exists."
fi

# Run SimpleBankingManagementSystemVF.sql first
echo "Running SimpleBankingManagementSystemVF.sql..."
$MYSQL_CMD $DB_NAME < backend/sql/SimpleBankingManagementSystemVF.sql

# Run initialDBSetup.sql after the first one
echo "Running initialDBSetup.sql..."
$MYSQL_CMD $DB_NAME < backend/sql/initialDBSetup.sql

# Cleanup
rm -f "$TMP_MY_CNF"

echo "Database setup complete."
