import os
from fastapi import APIRouter
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timezone
import math
import pytz

load_dotenv(".env.local")

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
  raise ValueError("CRITICAL: Supabase keys are missing! Check your backend/.env.local file.")

supabase: Client = create_client(url, key)

router = APIRouter()
manila = pytz.timezone("Asia/Manila")

@router.get("/api/parking/exited")
def get_exited_parking_status():
  try:
    response = supabase.table("licenseplate").select(
      "plate_number, time_in, time_out, status, total_fee"
    ).eq("status", "Exited").order("time_out", desc=True).limit(50).execute()

    return {"status": "success", "data": response.data}
  
  except Exception as e:
    return {"status": "error", "message": str(e)}
  

@router.post("/api/parking/checkout/{plate_number}")
def checkout_car(plate_number: str):
    try:
        # 1. Find the currently Active session for this exact license plate
        active_car = supabase.table("licenseplate").select("id, time_in").eq("plate_number", plate_number).eq("status", "Active").execute()
        
        if not active_car.data:
            return {"status": "error", "message": "No active parking session found for this plate."}
            
        car_id = active_car.data[0]["id"]
        time_in_str = active_car.data[0]["time_in"]
        
        # 2. Parse the time_in from Supabase and set the time_out to NOW
        # Replace "Z" handles standard ISO timestamps from PostgreSQL
        time_in = manila.localize(datetime.fromisoformat(time_in_str))
        time_out = datetime.now(manila)
        
        # 3. Calculate the official Total Fee
        elapsed_seconds = (time_out - time_in).total_seconds()
        elapsed_hours = elapsed_seconds / (60 * 60)
        
        billable_hours = math.ceil(elapsed_hours)
        total_fee = max(30, billable_hours * 30) # 30 PHP minimum, 30 per hour
        
        # 4. Update the row in Supabase permanently!
        update_data = {
            "status": "Exited",
            "time_out": time_out.isoformat(),
            "total_fee": total_fee
        }
        
        supabase.table("licenseplate").update(update_data).eq("id", car_id).execute()
        
        return {
            "status": "success", 
            "message": f"Successfully checked out {plate_number}",
            "final_fee": total_fee
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

