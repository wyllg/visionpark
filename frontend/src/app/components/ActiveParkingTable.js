'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

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
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/parking/active`);
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
  <div className="w-full pt-7">

    {/* HEADER */}
    <div className="w-full flex justify-between items-center pb-4 border-b border-moon/10 mb-4">
      <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-moon">
        <Activity className="w-4.5 h-4.5 text-mustard flex-shrink-0" />
        Active Parking
      </h2>
      <span className="text-xs text-slate-400 bg-slate/10 border border-moon/10 rounded-md px-2.5 py-1">
        {vehicles.length} cars
      </span>
    </div>

    {/* DESKTOP COLUMN HEADERS — hidden on mobile */}
    {vehicles.length > 0 && (
      <div className="hidden md:grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_80px] gap-x-4 px-3.5 pb-2">
        {["Plate", "Time in", "Elapsed", "Status"].map(h => (
          <span key={h} className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{h}</span>
        ))}
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 text-right">Fee</span>
      </div>
    )}

    {/* LIST */}
    <div className="space-y-px">
      {vehicles.length === 0 ? (
        <div className="py-10 text-center text-slate-400 italic text-sm">
          Lot is currently empty.
        </div>
      ) : (
        vehicles.map((car, idx) => (
          <div key={idx}>
            {/* DESKTOP ROW */}
            <div className="
              hidden md:grid
              grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_80px]
              gap-x-4 items-center
              px-3.5 py-2.5 rounded-lg
              border border-transparent
              hover:bg-slate/10 hover:border-moon/5
              transition-colors group cursor-default
            ">
              <span className="font-mono text-sm font-bold text-moon tracking-wide">
                {car.plate_number}
              </span>
              <span className="text-sm text-moon">
                {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-sm font-medium text-moon">
                {elapsedTime(car.time_in, car.time_out)}
              </span>
              <span>
                <span className={`${getBadgeClass(car.status)}`}>
                  {car.status}
                </span>
              </span>
              <span className="text-sm font-bold text-go text-right">
                ₱{calculateFee(car.time_in, car.time_out)}
              </span>
            </div>

            {/* MOBILE ROW — 2-col grid, stacked info */}
            <div className="
              md:hidden grid grid-cols-[1fr_auto] gap-x-3 items-start
              px-3 py-3 rounded-lg
              border border-transparent
              hover:bg-slate/10 hover:border-moon/5
              transition-colors
            ">
              {/* col 1 top: plate */}
              <span className="font-mono text-base font-bold text-moon tracking-wide">
                {car.plate_number}
              </span>
              {/* col 2 top: fee */}
              <span className="text-sm font-bold text-go text-right">
                ₱{calculateFee(car.time_in, car.time_out)}
              </span>
              {/* col 1 bottom: time · elapsed */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-moon/80">
                  In: {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-ocean text-xs">·</span>
                <span className="text-xs text-moon/80">
                  Elapsed: {elapsedTime(car.time_in, car.time_out)}
                </span>
              </div>
              {/* col 2 bottom: status badge */}
              <div className="flex justify-end mt-1">
                <span className={`badge text-xs px-2 py-0.5 ${getBadgeClass(car.status)}`}>
                  {car.status}
                </span>
              </div>
            </div>

            {idx < vehicles.length - 1 && (
              <div className="h-px bg-moon/5 mx-3" />
            )}
          </div>
        ))
      )}
    </div>
  </div>
);
}