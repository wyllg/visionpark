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

@router.get("/api/worker/status/active")
def worker_status():
    try:
        response =  supabase.table("workershift").select(
            "id, worker_id, worker_name, start_time, exit_shift, status"
        ).eq("status", "Active").order("start_time", desc=True).limit(10).execute()

        return {"status": "success", "data": response.data}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}