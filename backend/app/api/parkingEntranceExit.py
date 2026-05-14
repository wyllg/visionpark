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
    worker_id: str
    vehicle_type: str
    confidence_score: float

class ExitApprovalData(BaseModel):
    id: str
    plate_number: str
    worker_id: str
    vehicle_type: str = "Car"        # ← optional, default to Car
    confidence_score: float = 0.0 

PARKING_RATES = {
    "Car": {"hourly_rate": 30},
    "Motor": {"hourly_rate": 15}
}

# --- GET: FETCH PENDING QUEUES ---
@router.get("/api/parking/pending/{source_gate}") # <-- Removed vehicle_type
def get_pending(source_gate: str): # <-- Removed vehicle_type here too
    try:
        # Fetch all pending arrivals (both Cars and Motors)
        response = supabase.table("pendingplate")\
            .select("*")\
            .eq("status", "Pending")\
            .ilike("source_gate", source_gate)\
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
            "worker_in_id": data.worker_id,
            "vehicle_type": data.vehicle_type,
            "confidence_score": data.confidence_score
        }
        supabase.table("licenseplate").insert(new_row).execute()
        supabase.table("pendingplate").delete().eq("id", data.id).execute()

        return {"status": "success", "message": f"Entrance Approved: {data.plate_number}, {data.vehicle_type}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/api/parking/approve/exit")
def approve_exit(data: ExitApprovalData):
    try:
        # 1. Fetch Active Record (ADDED .strip() to clean invisible spaces!)
        clean_plate = data.plate_number.upper().strip()
        
        active_query = supabase.table("licenseplate")\
            .select("*")\
            .eq("plate_number", clean_plate)\
            .eq("status", "Active")\
            .execute()

        if not active_query.data:
            return {"status": "error", "message": "Vehicle not found!"}

        record = active_query.data[0]
        v_type = record.get("vehicle_type", "Car") # Default to Car if missing

        # 2. Calculate Duration
        time_in = datetime.fromisoformat(record["time_in"].replace("Z", "+00:00")).replace(tzinfo=None)
        time_out = datetime.now(manila).replace(tzinfo=None)
        
        # Prevent negative time glitches
        elapsed_seconds = max(0, (time_out - time_in).total_seconds())
        hours_parked = elapsed_seconds / 3600.0

        # 3. Dynamic Fee Logic
        billable_hours = max(1, math.ceil(hours_parked))

        if v_type == "Car":
            total_fee = billable_hours * 30.0
        else: # Motor
            total_fee = billable_hours * 15.0

        # 4. Database Update
        supabase.table("licenseplate").update({
            "status": "Exited",
            "time_out": datetime.now(manila).isoformat(),
            "total_fee": total_fee,
            "worker_exit_id": data.worker_id
        }).eq("id", record["id"]).execute()

        # 5. Cleanup
        supabase.table("pendingplate").delete().eq("id", data.id).execute()

        return {"status": "success", "fee": total_fee}

    except Exception as e:
        return {"status": "error", "message": str(e)}