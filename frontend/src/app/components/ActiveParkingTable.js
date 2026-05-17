'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ActiveParkingTable() {
  const [vehicles, setVehicles] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const getBadgeClass = (status) => {
    if (status === 'Active') return 'badge-active text-green-400 bg-green-400/10 border-green-400/20';
  };

  const getVehicleType = (vehicle_type) => {
    if (vehicle_type === 'Car') return 'text-ocean-light bg-ocean/10 border-ocean/80';
    if (vehicle_type === 'Motor') return ' text-mustard-light bg-mustard/10 border-mustard/50';
  }

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
    
    // 1. Fetch immediately when the page loads
    fetchParkingData();
    
    // 2. Set up Supabase Realtime to listen for any global changes
    const channel = supabase.channel('realtime-active-parking');

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'licenseplate' }, 
      (payload) => {
        console.log('Global database change detected! Refreshing Active Table'); 
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

  // 2. The Ticking Clock: Update the local time every second to drive the live math
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 
    return () => clearInterval(clockInterval);
  }, []);

  // 3. The Live Fee Calculator Function (Dynamic Rates)
  const calculateFee = (timeIn, timeOut, vehicleType) => {
    const start = new Date(timeIn);
    const end = timeOut ? new Date(timeOut) : currentTime; 
    
    // Calculate elapsed time in hours
    const elapsedMs = end - start;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    // Round UP to the nearest hour
    const billableHours = Math.ceil(elapsedHours);

    // Determine hourly rate based on vehicle type
    const isMotorcycle = vehicleType && vehicleType.toLowerCase().includes('motor');
    const hourlyRate = isMotorcycle ? 15 : 30;
    
    const fee = billableHours * hourlyRate;
    
    // Minimum fee is equal to 1 hour of their specific rate
    return Math.max(hourlyRate, fee).toFixed(2); 
  };

  const elapsedTime = (timeIn, timeOut) => {
    const start = new Date(timeIn);
    const end = timeOut ? new Date(timeOut) : currentTime; 
    
    const elapsedMs = Math.max(0, end - start); 
  
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes}m`; 
    }
    
    return `${hours}h ${minutes}m`; 
  }

  if (isLoading) {
    return (
      <div className="w-full pt-7 h-[500px] flex flex-col items-center justify-center border border-dashed border-moon/10 rounded-xl">
        <div className="animate-pulse text-moon/70 font-medium">Loading Live Data...</div>
      </div>
    );
  }

  return (
    <div className="w-full pt-7 h-[500px] flex flex-col">

      {/* HEADER */}
      {/* 2. SHRINK-0: Prevents the header from getting squished by the scrolling list */}
      <div className="w-full flex justify-between items-center pb-4 border-b border-moon/10 mb-4 shrink-0">
        <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-moon">
          <Activity className="w-4.5 h-4.5 text-mustard flex-shrink-0" />
          Active Parking
        </h2>
        <span className="text-xs text-slate-400 bg-slate/10 border border-moon/10 rounded-md px-2.5 py-1">
          {vehicles.length} cars
        </span>
      </div>

      {/* DESKTOP COLUMN HEADERS */}
      {vehicles.length > 0 && (
        <div className="hidden md:grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px] gap-x-4 px-3.5 pb-2 shrink-0">
          {["Plate", "Type", "Date", "Time In", "Elapsed", "Fee"].map((h, i) => (
            <span key={h} className={`text-[11px] font-semibold uppercase tracking-widest text-slate-400 ${i === 5 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* LIST */}
      {/* 3. OVERFLOW-Y-AUTO & FLEX-1: This is the magic. It takes up the remaining space and scrolls internally! */}
      <div className="space-y-px overflow-y-auto flex-1 pr-2 custom-scrollbar">
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
                grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px]
                gap-x-4 items-center
                px-3.5 py-2.5 rounded-lg
                border border-transparent
                hover:bg-slate/10 hover:border-moon/5
                transition-colors group cursor-default
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
                  {new Date(car.time_in).toLocaleDateString([], { month: 'long', day: '2-digit', year: 'numeric' })}
                </span>
                <span className="text-sm text-moon">
                  {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-sm font-medium text-moon">
                  {elapsedTime(car.time_in, car.time_out)}
                </span>
                <span className="text-sm font-bold text-green-400 text-right">
                  ₱{calculateFee(car.time_in, car.time_out, car.vehicle_type)}
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
                {/* col 1 top: plate + vehicle type badge */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-moon tracking-wide">
                    {car.plate_number}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${getVehicleType(car.vehicle_type)}`}>
                    {car.vehicle_type}
                  </span>
                </div>
                
                {/* col 2 top: fee */}
                <span className="text-sm font-bold text-green-400 text-right">
                  ₱{calculateFee(car.time_in, car.time_out, car.vehicle_type)}
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
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${getBadgeClass(car.status)}`}>
                    {car.status}
                  </span>
                </div>
              </div>

              {/* Divider */}
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