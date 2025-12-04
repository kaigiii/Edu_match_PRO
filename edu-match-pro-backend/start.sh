#!/bin/bash
set -e
export PYTHONPATH=$PYTHONPATH:.

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Ingest school statistics data (CSV)
echo "Ingesting school statistics data..."
python scripts/ingest_school_tables.py

# Rebuild demo data
echo "Rebuilding demo data..."
python scripts/rebuild_demo_data.py

# Start the application
echo "Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 3001
