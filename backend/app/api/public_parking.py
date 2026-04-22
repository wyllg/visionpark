# backend/app/api/public_parking.py
from fastapi import APIRouter
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

router = APIRouter()

# Initialize Supabase client
url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

@router.get("/test")
def get_live_parking_status():
    try:
        # Fetch active and recently exited parking sessions
        # We only need the columns relevant to the public table
        response = supabase.table("parking_sessions").select(
            "plate_number, time_in, time_out, status"
        ).order("time_in", desc=True).limit(50).execute()
        
        return {"status": "success", "data": response.data}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}