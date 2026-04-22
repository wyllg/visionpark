# backend/app/main.py

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 1. Import your feature routes here
# (Assuming you saved the live parking status code in backend/app/api/public_parking.py)
from app.api import public_parking 

# 2. Load Environment Variables from your .env.local file
# This ensures your Supabase keys and database URLs are securely loaded
load_dotenv(".env.local")

# 3. Initialize the FastAPI Application
app = FastAPI(
    title="VisionPark Backend API",
    description="The core data bridge for the VisionPark automated parking system.",
    version="1.0.0"
)

# 4. Configure CORS (Cross-Origin Resource Sharing)
# THIS IS CRITICAL: Without this, your browser will block Next.js from talking to FastAPI!
origins = [
    "http://localhost:3000",  # Your local Next.js frontend
    # You will add your actual production domain here later (e.g., "https://visionpark.vercel.app")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers
)

# 5. Connect your Feature Routers
# This tells FastAPI: "If a request comes in for /api/parking/live-status, use the code in public_parking.py"
app.include_router(public_parking.router)

# Optional: Add any future routes here as you build them!
# app.include_router(auth.router)
# app.include_router(billing.router)

# 6. A simple Health Check endpoint at the root URL
@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the VisionPark API Gateway. Systems are nominal."
    }