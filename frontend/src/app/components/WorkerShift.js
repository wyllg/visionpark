"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import EntranceApproval from './EntranceApproval';
import ExitApproval from './ExitApproval';
import { UserKey } from 'lucide-react';

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
      <div className="w-full pt-4">
        <div className="w-full flex justify-between items-center pb-4 border-b border-moon/10 mb-4">
          <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-moon">
            <UserKey className="w-4.5 h-4.5 text-ocean flex-shrink-0" />
            Worker
          </h2>
        </div>
      
      <div className="flex flex-col items-center p-6 rounded-lg ">
        <h2 className="text-lg font-bold mb-2">Gate is Unattended</h2>
        <p className="text-moon/80 text-sm mb-4">You must clock in to start monitoring vehicles.</p>
        <button
          onClick={handleClockIn}
          className="max-w-6xl bg-ocean text-moon font-semibold px-5 py-1.5 rounded hover:bg-ocean-dark transition-all hover:scale-102 active:scale-98 active:brightness-75"
        >
          Clock In
        </button>
      </div>
      </div>
    );
  }

  // ==========================================
  // STATE 2: SOMEONE IS CLOCKED IN (AND IT IS ME)
  // ==========================================
  if (activeShift.worker_id === user.id) {
    return (
      <div className="w-full pt-4">
        <div className="w-full flex justify-between items-center pb-4 border-b border-moon/10 mb-4">
          <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-moon">
            <UserKey className="w-4.5 h-4.5 text-ocean flex-shrink-0" />
            Worker
          </h2>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-go ">Active Shift</h2>
            <p className="text-sm ">
              Started at: {new Date(activeShift.start_time).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleClockOut}
            className="bg-cherry text-moon font-semibold px-4 py-2 rounded hover:bg-cherry-dark transition-all hover:scale-102 active:scale-98 active:brightness-75"
          >
            End Shift (Clock Out)
          </button>
        </div>

        {/* YUNG NAKA CLOCK IN AY MAKIKITA ITONG MGA CAR ENTRANCE AND EXIT SHIT
        */}
        <div className="space-y-3">
          <EntranceApproval onApprove={onApprove}/>
          <ExitApproval onApprove={onApprove}/>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 3: SOMEONE IS CLOCKED IN (AND IT IS NOT ME) bye bye previous worker
  // ==========================================
  return (
    <div className="flex flex-col items-center p-4 bg-mustard/10 rounded-xl shadow-sm border border-mustard/60">
      <h2 className="text-xl font-bold text-moon mb-2">Gate is Attended</h2>
      <p className="text-mustard-light mb-6">
        <strong className="text-mustard">{activeShift.worker_name}</strong> is currently on shift.
      </p>
      
      <p className="text-sm text-moon mb-4">
        Need to relieve them? Taking over will automatically clock them out and clock you in.
      </p>
      
      <button
        onClick={handleClockIn}
        className=" bg-yellow-600 px-4 py-2 text-moon font-semibold rounded hover:bg-mustard-dark transition"
      >
        Take Over Shift
      </button>
    </div>
  );
}