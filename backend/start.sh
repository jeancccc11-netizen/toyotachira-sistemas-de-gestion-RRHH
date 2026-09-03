#!/bin/bash
echo "========================================="
echo "  SI-GHR - Toyotachira S.A."
echo "  Iniciando sistema..."
echo "========================================="
echo ""

# Step 1: Initialize database
echo "[1/3] Initializing database on Supabase..."
node scripts/init-db.js
echo ""

# Step 2: Start backend
echo "[2/3] Starting backend server on port 3001..."
echo ""
node src/index.js &
BACKEND_PID=$!

# Step 3: Start frontend
echo "[3/3] Starting frontend on port 5173..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "  ✅ SI-GHR Running!"
echo "  Backend:  http://localhost:3001/api"
echo "  Frontend: http://localhost:5173"
echo "  Login:    admin / admin123"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
