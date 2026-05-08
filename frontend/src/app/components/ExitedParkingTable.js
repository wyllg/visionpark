'use client';

import { useState, useEffect } from 'react';

export default function ExitedParkingTable({ refreshTrigger }) {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch the EXITED data from FastAPI
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        // Pointing to your exited endpoint
        const res = await fetch('http://localhost:8000/api/parking/exited');
        const json = await res.json();
        if (json.status === 'success') {
          setVehicles(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch exited parking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParkingData();

  }, [refreshTrigger]);

  // 2. A simplified Elapsed Time calculator (No live clock needed!)
  const elapsedTime = (timeIn, timeOut) => {
    if (!timeOut) return '--'; // Safety check
    
    const start = new Date(timeIn);
    const end = new Date(timeOut);
    
    const elapsedMs = Math.max(0, end - start);
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Archive...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      
      {/* HEADER SECTION */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 pt-7">
        <h2 className="license-plate-red text-xl sm:text-xl w-full justify-center">
          EXITED PARKING
        </h2>
      </div>

      {/* RESPONSIVE DATA CONTAINER (Replaces the Table) */}
      <div className="space-y-4">
        {vehicles.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 italic">
            No cars have exited yet.
          </div>
        ) : (
          vehicles.map((car, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors border-l-4 border-l-slate-500"
            >
              
              {/* TOP ROW (Mobile) / LEFT COLUMN (Desktop): Plate */}
              <div className="flex justify-between items-center md:w-1/5">
                <div className="font-mono text-xl sm:text-2xl font-bold text-white bg-slate-900 px-3 py-1 rounded border border-slate-700 shadow-inner tracking-wider">
                  {car.plate_number}
                </div>
              </div>

              {/* MIDDLE ROW (Mobile) / MIDDLE COLUMNS (Desktop): Time Tracking Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm md:flex md:w-3/5 md:justify-around bg-slate-900/30 p-3 rounded-lg md:bg-transparent md:p-0">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Time In</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Time Out</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(car.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Spans 2 columns on tiny phones, 1 on larger screens */}
                <div className="flex flex-col col-span-2 sm:col-span-1 border-t border-slate-700/50 pt-2 sm:border-0 sm:pt-0">
                  <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-1">Total Time</span>
                  <span className="text-slate-300 font-medium">{elapsedTime(car.time_in, car.time_out)}</span>
                </div>
              </div>

              {/* BOTTOM ROW (Mobile) / RIGHT COLUMN (Desktop): Paid Amount */}
              <div className="flex justify-between items-center md:w-1/5 md:justify-end border-t border-slate-700/50 md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold md:hidden">
                  Amount Paid
                </span>
                <span className="font-mono font-bold text-red-500 text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]">
                  ₱{car.total_fee?.toFixed(2) || '0.00'}
                </span>
              </div>

            </div>
          ))
        )}
      </div>
      
    </div>
  );
}