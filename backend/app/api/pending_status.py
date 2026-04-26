# backend/app/api/public_parking.py
import os
from fastapi import APIRouter
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(".env.local")

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("CRITICAL: Supabase keys are missing! Check your backend/.env.local file.")

supabase: Client = create_client(url, key)

router = APIRouter()

@router.get("/api/parking/pending")
def active_status():
    try:
        # Fetch ONLY active parking sessions
        response = supabase.table("licenseplate").select(
            "id, plate_number, time_in, time_out, status"
        ).eq("status", "Pending").order("time_in", desc=True).limit(50).execute()
        
        return {"status": "success", "data": response.data}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}