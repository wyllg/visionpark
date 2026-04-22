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

@router.get("/api/parking/exited")
def get_exited_parking_status():
  try:
    response = supabase.table("licenseplate").select(
      "plate_number, time_in, time_out, status, total_fee"
    ).eq("status", "Exited").order("time_out", desc=True).limit(50).execute()

    return {"status": "success", "data": response.data}
  
  except Exception as e:
    return {"status": "error", "message": str(e)}

