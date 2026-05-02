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
import pytz

load_dotenv(".env.local")

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("CRITICAL: Supabase keys are missing! Check your backend/.env.local file.")

supabase: Client = create_client(url, key)

router = APIRouter()
manila = pytz.timezone("Asia/Manila")

class PlateData(BaseModel):
    original_plate_read: str

"""
ONCE THE IMAGE PROCESSING EDGE SENDS A LICENSE PLATE THEY AUTOMATICALLY GET A PENDING STATUS
AND IS DISPLAYED IN EntranceApproval.js 
"""
@router.post("/api/parking/entry")
def register_car_entry(data: PlateData):
    try:
        new_row = {
            "original_plate_read": data.original_plate_read,
            "time_in": datetime.now(manila).isoformat(),
            "status": "Pending"
        }
        supabase.table("licenseplate").insert(new_row).execute()
        return {"status": "success", "message": "Sent to Worker Waiting Room"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class ApprovalData(BaseModel):
    id: int               # The database row ID
    license_plate: str  # The human-corrected plate number

"""
ONCE THE WORKER APPROVES THE LICENSE PLATE, THE STATUS CHANGES TO ACTIVE AND IT IS DISPLAYED
IN ActiveParkingTable.js
"""
@router.put("/api/parking/approve")
def approve_car(data: ApprovalData):
    try:
        # 1. Fetch the existing row to see what the AI originally guessed
        db_check = supabase.table("licenseplate").select("original_plate_read").eq("id", data.id).execute()
        
        # Safety check in case the ID doesn't exist
        if not db_check.data:
            return {"status": "error", "message": "Car not found in database"}
            
        original_guess = db_check.data[0].get("original_plate_read")
        
        # 2. Compare the AI guess to what the worker typed!
        # This will evaluate to True if they are different, and False if they are exactly the same.
        is_corrected = original_guess != data.license_plate

        # 3. Update the database with the new column
        update_data = {
            "plate_number": data.license_plate,
            "status": "Active",
            "is_manually_corrected": is_corrected # Inserts True or False into Supabase
        }
        
        supabase.table("licenseplate").update(update_data).eq("id", data.id).execute()
        
        return {"status": "success", "message": "Car Approved and Public!"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
