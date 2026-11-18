#!/bin/bash
set -e

echo ""
echo "  PlacePro — Campus Placement Management System"
echo "  =============================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "  [ERROR] Docker is not installed."
    echo "  Install from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "  [ERROR] Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo "  [1/3] Stopping any previous containers..."
docker-compose down 2>/dev/null || true

echo "  [2/3] Building and starting all services..."
echo "         (First run may take 3-5 minutes)"
echo ""
docker-compose up --build -d

echo ""
echo "  [3/3] Waiting for services to be ready..."
sleep 15

echo ""
echo "  ============================================"
echo "   PlacePro is RUNNING!"
echo "  ============================================"
echo ""
echo "   Frontend  ->  http://localhost:3000"
echo "   Backend   ->  http://localhost:8080"
echo "   Database  ->  localhost:5432 (placementdb)"
echo ""
echo "   Register at: http://localhost:3000/register"
echo ""
echo "   To stop:  ./stop.sh  OR  docker-compose down"
echo "  ============================================"
echo ""
