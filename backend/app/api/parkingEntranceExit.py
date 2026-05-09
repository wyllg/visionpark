"""
THIS API IS FOR POSTING CARS THAT ENTER (GIVES A PENDING STATUS) 
AND PUTTING CARS THAT GET APPROVED (EDITS INTO AN ACTIVE STATUS)
"""
import os
from fastapi import APIRouter
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
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

# --- PYDANTIC MODELS ---
class EntranceApprovalData(BaseModel):
    id: str
    plate_number: str
    worker_id: str  # NEW: The Clerk ID of the worker approving the entrance

class ExitApprovalData(BaseModel):
    id: str
    plate_number: str
    worker_id: str  # NEW: The Clerk ID of the worker checking them out

# --- GET: FETCH PENDING QUEUES ---
@router.get("/api/parking/pending/entrance")
def get_pending_entrances():
    try:
        # Fetch only pending arrivals
        response = supabase.table("pendingplate")\
            .select("*")\
            .eq("status", "Pending")\
            .eq("source_gate", "Entrance")\
            .order("detection_time", desc=False)\
            .execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/api/parking/pending/exit")
def get_pending_exits():
    try:
        # Fetch only pending departures (includes fuzzy match suggestions)
        response = supabase.table("pendingplate")\
            .select("*")\
            .eq("status", "Pending")\
            .eq("source_gate", "Exit")\
            .order("detection_time", desc=False)\
            .execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- POST: PROCESS APPROVALS ---
@router.post("/api/parking/approve/entrance")
def approve_entrance(data: EntranceApprovalData):
    try:
        new_row = {
            "plate_number": data.plate_number.upper(),
            "time_in": datetime.now(manila).isoformat(),
            "status": "Active",
            "worker_in_id": data.worker_id # <-- Saved here!
        }
        supabase.table("licenseplate").insert(new_row).execute()
        supabase.table("pendingplate").delete().eq("id", data.id).execute()

        return {"status": "success", "message": f"Entrance Approved: {data.plate_number}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/api/parking/approve/exit")
def approve_exit(data: ExitApprovalData):
    try:
        # 1. Find the car in Active Parking
        active_car = supabase.table("licenseplate")\
            .select("*")\
            .eq("plate_number", data.plate_number.upper())\
            .eq("status", "Active")\
            .execute()

        if not active_car.data:
            return {"status": "error", "message": "Car not found in active parking!"}

        car_record = active_car.data[0]

        # 2. Calculate the Time Parked (Safely handling timezones)
        time_in_str = car_record["time_in"].replace("Z", "+00:00")
        time_in = datetime.fromisoformat(time_in_str)
        
        time_out = datetime.now(manila)
        
        # Ensure BOTH times are stripped of timezone data before subtracting to prevent crashes
        time_in_naive = time_in.replace(tzinfo=None)
        time_out_naive = time_out.replace(tzinfo=None)
        
        # Get difference in hours
        duration_seconds = (time_out_naive - time_in_naive).total_seconds()
        hours_parked = duration_seconds / 3600.0

        # 3. Calculate Total Fee (Example: Standard PH Mall Rate)
        # Flat rate of 40 PHP for the first 3 hours, then 10 PHP per succeeding hour
        if hours_parked <= 1:
            total_fee = 30.00
        else:
            # math.ceil rounds up (e.g., 3.1 hours becomes 4 hours of charging)
            total_hours = max(1, math.ceil(hours_parked))
            total_fee = total_hours * 30.00

        # 4. Update the Database with Fee and Worker ID
        supabase.table("licenseplate")\
            .update({
                "status": "Exited", 
                "time_out": time_out.isoformat(),
                "total_fee": total_fee,                 # <-- Saved here!
                "worker_exit_id": data.worker_id         # <-- Saved here!
            })\
            .eq("id", car_record["id"])\
            .execute()

        # 5. Delete from Pending Detections
        supabase.table("pendingplate").delete().eq("id", data.id).execute()

        return {
            "status": "success", 
            "message": f"Exit Approved. Fee: ₱{total_fee:.2f}"
        }
    except Exception as e:
        print(f"Exit Error: {e}")
        return {"status": "error", "message": str(e)}