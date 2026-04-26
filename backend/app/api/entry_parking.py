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
    plate_number: str

@router.post("/api/parking/entry")
def register_car_entry(data: PlateData):
    try:
        new_row = {
            "plate_number": data.plate_number,
            "time_in": datetime.now(manila).isoformat(),
            "status": "Pending"
        }
        supabase.table("licenseplate").insert(new_row).execute()
        return {"status": "success", "message": "Sent to Worker Waiting Room"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

class ApprovalData(BaseModel):
    id: int               # The database row ID
    corrected_plate: str  # The human-corrected plate number

@router.put("/api/parking/approve")
def approve_car(data: ApprovalData):
    try:
        # The worker officially approves it, changing it to Active!
        update_data = {
            "plate_number": data.corrected_plate,
            "status": "Active"
        }
        supabase.table("licenseplate").update(update_data).eq("id", data.id).execute()
        return {"status": "success", "message": "Car Approved and Public!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
