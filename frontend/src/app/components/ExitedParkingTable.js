'use client';

import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // <-- 1. Import your Supabase client

export default function ExitedParkingTable() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getVehicleType = (vehicle_type) => {
    if (vehicle_type === 'Car') return 'text-ocean-light bg-ocean/10 border-ocean/80';
    if (vehicle_type === 'Motor') return ' text-mustard-light bg-mustard/10 border-mustard/50';
  }

  // 1. Fetch the EXITED data from FastAPI
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/parking/exited`);
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
    
// 1. Fetch immediately when the page loads
    fetchParkingData();
    
    // 2. Set up Supabase Realtime to listen for any global changes
    const channel = supabase.channel('realtime-exited-parking');

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'licenseplate' }, 
      (payload) => {
        console.log('🔄 Global database change detected! Refreshing Exited Table...'); 
        fetchParkingData();
      }
    );

    // Subscribe AFTER attaching the listener (to prevent Next.js Strict Mode bugs)
    channel.subscribe();

    // 3. Clean up the connection when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

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
  <div className="w-full pt-7 min-h-[400px]">

    {/* HEADER */}
    <div className="w-full flex justify-between items-center pb-4 border-b border-moon/10 mb-4">
      <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-moon">
        <LogOut className="w-4.5 h-4.5 text-cherry flex-shrink-0" />
        Exited Cars
      </h2>
      <span className="text-xs text-slate-400 bg-slate/10 border border-moon/10 rounded-md px-2.5 py-1">
        {vehicles.length} cars
      </span>
    </div>

    {/* DESKTOP COLUMN HEADERS */}
    {vehicles.length > 0 && (
      <div className="hidden md:grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px] gap-x-4 px-3.5 pb-2">
        {["Plate","Type", "Time in", "Time out", "Total time"].map(h => (
          <span key={h} className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{h}</span>
        ))}
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 text-right">Paid</span>
      </div>
    )}

    {/* LIST */}
    <div className="space-y-px">
      {vehicles.length === 0 ? (
        <div className="py-10 text-center text-slate-400 italic text-sm">
          No cars have exited yet.
        </div>
      ) : (
        vehicles.map((car, idx) => (
          <div key={idx}>

            {/* DESKTOP ROW */}
            <div className="
              hidden md:grid
              grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px]
              gap-x-4 items-center
              px-3.5 py-2.5 rounded-lg
              border border-transparent
              hover:bg-slate/10 hover:border-moon/5
              transition-colors cursor-default
            ">
              <span className="font-mono text-sm font-bold text-moon tracking-wide">
                {car.plate_number}
              </span>
              <span>
                <span className={`px-2 py-0.5 rounded text-xs border ${getVehicleType(car.vehicle_type)}`}>
                  {car.vehicle_type}
                </span>
              </span>
              <span className="text-sm text-moon">
                {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-sm text-moon">
                {new Date(car.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-sm font-medium text-moon">
                {elapsedTime(car.time_in, car.time_out)}
              </span>
              <span className="text-sm font-bold text-cherry text-right">
                ₱{car.total_fee?.toFixed(2) || '0.00'}
              </span>
            </div>

            {/* MOBILE ROW */}
            <div className="
              md:hidden grid grid-cols-[1fr_auto] gap-x-3 items-start
              px-3 py-3 rounded-lg
              border border-transparent
              hover:bg-slate/10 hover:border-moon/5
              transition-colors
            ">
              {/* col 1 top: plate */}
              <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-moon tracking-wide">
                    {car.plate_number}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${getVehicleType(car.vehicle_type)}`}>
                    {car.vehicle_type}
                  </span>
                </div>
              {/* col 2 top: amount paid */}
              <span className="text-sm font-bold text-cherry text-right">
                ₱{car.total_fee?.toFixed(2) || '0.00'}
              </span>
              {/* col 1 bottom: times + duration */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-moon/80">
                  In: {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-ocean text-xs">·</span>
                <span className="text-xs text-moon/80">
                  Out: {new Date(car.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-ocean text-xs">·</span>
                <span className="text-xs text-moon/80">
                  Time: {elapsedTime(car.time_in, car.time_out)}
                </span>
              </div>
              {/* col 2 bottom: empty placeholder to keep grid aligned */}
              <div />
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