# backend/app/main.py

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 1. Import your feature routes here
# (Assuming you saved the live parking status code in backend/app/api/public_parking.py)
from app.api import statusActive
from app.api import statusExited
from app.api import statusPending
from app.api import parkingEntranceExit
from app.api import workerStatus
from app.api import workerShift


# 2. Load Environment Variables from your .env.local file
# This ensures your Supabase keys and database URLs are securely loaded
load_dotenv(".env.local")

# 3. Initialize the FastAPI Application
app = FastAPI(
    title="VisionPark Backend API",
    description="The core data bridge for the VisionPark automated parking system.",
    version="1.0.0"
)

# 1. Grab the string from the environment variable
# We add a fallback to localhost just in case the env var fails to load
origins_string = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

# 2. Split the string into a Python list
allowed_origins_list = origins_string.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Connect your Feature Routers
# This tells FastAPI: "If a request comes in for /api/parking/live-status, use the code in public_parking.py"
app.include_router(statusActive.router)
app.include_router(statusExited.router)
app.include_router(parkingEntranceExit.router)
app.include_router(statusPending.router)
app.include_router(workerStatus.router)
app.include_router(workerShift.router)


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