"""
THIS API IS FOR THE ADMIN DASHBOARD
It handles fetching live statistics (revenue, active cars, shifts)
and exporting database tables for CSV downloads.
"""
import os
from fastapi import APIRouter
from supabase import create_client, Client
from dotenv import load_dotenv
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

# --- GET: DASHBOARD STATISTICS ---
@router.get("/api/admin/stats")
def get_admin_stats():
    try:
        now = datetime.now(manila)
        # Get the start of today (Midnight in Manila time) to filter today's revenue
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

        # 1. Get Active Cars Count
        active_cars_res = supabase.table("licenseplate")\
            .select("id")\
            .eq("status", "Active")\
            .execute()
        active_cars_count = len(active_cars_res.data)

        # 2. Get Today's Revenue and Exits
        exited_today_res = supabase.table("licenseplate")\
            .select("total_fee")\
            .eq("status", "Exited")\
            .gte("time_out", start_of_today)\
            .execute()

        todays_exits = len(exited_today_res.data)
        todays_revenue = sum(car.get("total_fee") or 0.0 for car in exited_today_res.data)

        # 3. Get Currently Active Worker
        # NOTE: Make sure your worker shift table is named exactly like this in Supabase
        worker_res = supabase.table("workershift")\
            .select("worker_name")\
            .eq("status", "Active")\
            .execute()

        active_worker = "No Active Shift"
        if worker_res.data and len(worker_res.data) > 0:
            active_worker = worker_res.data[0].get("worker_name", "Unknown")

        return {
            "status": "success",
            "data": {
                "activeWorker": active_worker,
                "todaysRevenue": todays_revenue,
                "activeCars": active_cars_count,
                "todaysExits": todays_exits
            }
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"status": "error", "message": str(e)}


# --- GET: EXPORT TABLES FOR CSV ---
@router.get("/api/admin/export/licenseplate")
def export_license_plate_history():
    try:
        # Fetch all records, newest first
        response = supabase.table("licenseplate").select("*").order("time_in", desc=True).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/api/admin/export/workershift")
def export_worker_shift_history():
    try:
        # Fetch all shift records, newest first
        response = supabase.table("workershift").select("*").order("start_time", desc=True).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}