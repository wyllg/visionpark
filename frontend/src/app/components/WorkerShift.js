"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import EntranceApproval from './EntranceApproval';

export default function WorkerShift({ onApprove }) {
  const { user, isLoaded } = useUser();
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveShift = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/worker/status/active");
      const data = await res.json();
      
      if (data.status === "success" && data.data.length > 0) {
        setActiveShift(data.data[0]);
      } else {
        setActiveShift(null); // No one is clocked in
      }
    } catch (error) {
      console.error("Error fetching shift:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveShift();
    // Optional: Refresh every 30 seconds to catch if someone else takes over
    const interval = setInterval(fetchActiveShift, 30000); 
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await fetch("http://localhost:8000/api/worker/clock_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: user.id,
          worker_name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress,
        }),
      });
      fetchActiveShift();
    } catch (error) {
      console.error("Failed to clock in:", error);
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await fetch("http://localhost:8000/api/worker/clock_out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: user.id,
          worker_name: user.fullName || user.firstName,
        }),
      });
      fetchActiveShift();
    } catch (error) {
      console.error("Failed to clock out:", error);
      setLoading(false);
    }
  };

  if (!isLoaded || loading) return <div className="p-4 text-gray-500">Loading Gate Status...</div>;

  // ==========================================
  // STATE 1: NO ONE IS CLOCKED IN
  // ==========================================
  if (!activeShift) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md border-t-4 border-gray-300">
        <h2 className="text-xl font-bold mb-2">Gate is Unattended</h2>
        <p className="text-gray-600 mb-6">You must clock in to start monitoring vehicles.</p>
        <button
          onClick={handleClockIn}
          className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded hover:bg-blue-700 transition"
        >
          Clock In
        </button>
      </div>
    );
  }

  // ==========================================
  // STATE 2: SOMEONE IS CLOCKED IN (AND IT IS ME)
  // ==========================================
  if (activeShift.worker_id === user.id) {
    return (
      <div className="p-6 bg-green-50 rounded-lg shadow-md max-w-3xl border-t-4 border-green-500">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-green-800">🟢 Active Shift</h2>
            <p className="text-sm text-green-600">
              Started at: {new Date(activeShift.start_time).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleClockOut}
            className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition"
          >
            End Shift (Clock Out)
          </button>
        </div>

        {/* YUNG NAKA CLOCK IN AY MAKIKITA ITONG MGA CAR ENTRANCE AND EXIT SHIT
        */}
        <div>
          <EntranceApproval onApprove={onApprove}/>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 3: SOMEONE IS CLOCKED IN (AND IT IS NOT ME) bye bye previous worker
  // ==========================================
  return (
    <div className="p-6 bg-yellow-50 rounded-lg shadow-md max-w-md border-t-4 border-yellow-500">
      <h2 className="text-xl font-bold text-yellow-800 mb-2">Gate is Attended</h2>
      <p className="text-yellow-700 mb-6">
        <strong>{activeShift.worker_name}</strong> is currently on shift.
      </p>
      
      <p className="text-sm text-gray-600 mb-4">
        Need to relieve them? Taking over will automatically clock them out and clock you in.
      </p>
      
      <button
        onClick={handleClockIn}
        className="w-full bg-yellow-600 text-white font-semibold px-4 py-3 rounded hover:bg-yellow-700 transition"
      >
        Take Over Shift
      </button>
    </div>
  );
}