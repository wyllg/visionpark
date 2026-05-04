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

class WorkerRequest(BaseModel):
    worker_id: str
    worker_name: str

@router.get("/api/worker/status/active")
def worker_status():
    """Returns the currently active shift, if any."""
    try:
        response = supabase.table("workershift").select(
            "id, worker_id, worker_name, start_time, exit_shift, status"
        ).eq("status", "Active").order("start_time", desc=True).limit(1).execute()

        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/api/worker/clock_in")
def clock_in(req: WorkerRequest):
    """Clocks a worker in. Automatically clocks out anyone else currently active (Takeover logic)."""
    try:
        current_time = datetime.now(manila).isoformat()

        # 1. Force-close any existing active shifts
        supabase.table("workershift").update({
            "status": "Completed",
            "exit_shift": current_time
        }).eq("status", "Active").execute()

        # 2. Create the new shift for the requesting worker
        new_shift = {
            "worker_id": req.worker_id,
            "worker_name": req.worker_name,
            "start_time": current_time,
            "status": "Active"
        }
        
        response = supabase.table("workershift").insert(new_shift).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/api/worker/clock_out")
def clock_out(req: WorkerRequest):
    """Ends the shift only for the requesting worker."""
    try:
        current_time = datetime.now(manila).isoformat()

        response = supabase.table("workershift").update({
            "status": "Completed",
            "exit_shift": current_time
        }).eq("worker_id", req.worker_id).eq("status", "Active").execute()

        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}