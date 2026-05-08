'use client';

import { useState, useEffect } from 'react';

export default function ActiveParkingTable({ refreshTrigger }) {
  const [vehicles, setVehicles] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to map your DB status to the globals.css badge classes
  const getBadgeClass = (status) => {
    if (status === 'Active') return 'badge-active';
    if (status === 'Needs_Review') return 'badge-pending';
    return 'badge-exited'; // Default/Fallback
  };

  // Helper function for the little glowing dot inside the badge
  const getDotClass = (status) => {
    if (status === 'Active') return 'bg-green-400';
    if (status === 'Needs_Review') return 'bg-yellow-400';
    return 'bg-red-400'; // Default/Fallback
  };

  // 1. Fetch the data from FastAPI when the page loads
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/parking/active');
        const json = await res.json();
        if (json.status === 'success') {
          setVehicles(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch parking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParkingData();
    
  }, [refreshTrigger]);

  // 2. The Ticking Clock: Update the local time every second to drive the live math
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Ticks every 1 second
    return () => clearInterval(clockInterval);
  }, []);

  // 3. The Live Fee Calculator Function (30 Pesos / Hour)
  const calculateFee = (timeIn, timeOut) => {
    const start = new Date(timeIn);
    // If the car has left, use timeOut. If it is still parked, use the ticking currentTime!
    const end = timeOut ? new Date(timeOut) : currentTime; 
    
    // Calculate elapsed time in hours
    const elapsedMs = end - start;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    // Standard parking logic: round UP to the nearest hour (e.g., 1.1 hours = 2 hours)
    // If you want exact decimal billing, remove Math.ceil
    const billableHours = Math.ceil(elapsedHours);
    const fee = billableHours * 30; // 30 PHP per hour
    
    // Minimum fee of 30 PHP
    return Math.max(30, fee).toFixed(2); 
  };

  const elapsedTime = (timeIn, timeOut) => {
    const start = new Date(timeIn);
    // If the car has left, use timeOut. If it is still parked, use the ticking currentTime!
    const end = timeOut ? new Date(timeOut) : currentTime; 
    
    const elapsedMs = Math.max(0, end - start); // Math.max prevents negative time glitches
  
    // 2. Calculate whole hours
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    
    // 3. Calculate remaining whole minutes using the modulo (%) operator
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    // 4. Return a clean, readable string
    if (hours === 0) {
      return `${minutes}m`; // e.g., "45m"
    }
    
    return `${hours}h ${minutes}m`; // e.g., "2h 15m"
  }

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Live Status...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 pt-7">
        <h2 className="license-plate-green text-xl sm:text-xl w-full justify-center">
          LIVE PARKING
        </h2>
      </div>

      {/* RESPONSIVE DATA CONTAINER (Replaces the Table) */}
      <div className="space-y-4">
        {vehicles.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 italic">
            Lot is currently empty.
          </div>
        ) : (
          vehicles.map((car, idx) => (
            <div 
              key={idx} 
              className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors border-l-4 border-l-green-500"
            >
              
              {/* TOP ROW (Mobile) / LEFT COLUMN (Desktop): Plate & Status */}
              <div className="flex justify-between items-center md:w-1/4">
                <div className="font-mono text-xl sm:text-2xl font-bold text-white bg-slate-900 px-3 py-1 rounded border border-slate-700 shadow-inner tracking-wider">
                  {car.plate_number}
                </div>
                {/* Show status here only on mobile */}
                <div className="md:hidden">
                  <span className={`badge ${getBadgeClass(car.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getDotClass(car.status)}`}></span>
                    {car.status}
                  </span>
                </div>
              </div>

              {/* MIDDLE ROW (Mobile) / MIDDLE COLUMNS (Desktop): Time Tracking */}
              <div className="flex flex-row justify-between text-sm md:w-2/4 md:justify-center md:gap-12 bg-slate-900/30 p-3 rounded-lg md:bg-transparent md:p-0">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Time In</span>
                  <span className="text-slate-100 font-medium">
                    {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-1">Duration</span>
                  <span className="text-slate-100 font-medium">{elapsedTime(car.time_in, car.time_out)}</span>
                </div>
              </div>

              {/* DESKTOP STATUS (Hidden on mobile, shown on tablet+) */}
              <div className="hidden md:flex md:w-1/6 justify-center">
                <span className={`badge ${getBadgeClass(car.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getDotClass(car.status)}`}></span>
                  {car.status}
                </span>
              </div>

              {/* BOTTOM ROW (Mobile) / RIGHT COLUMN (Desktop): Fee */}
              <div className="flex justify-between items-center md:w-1/6 md:justify-end border-t border-slate-700/50 md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold md:hidden">
                  To Be Paid
                </span>
                <span className="font-mono font-bold text-green-400 text-2xl drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]">
                  ₱{calculateFee(car.time_in, car.time_out)}
                </span>
              </div>

            </div>
          ))
        )}
      </div>
      
    </div>
  );
}