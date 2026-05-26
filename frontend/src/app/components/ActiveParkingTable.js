'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@clerk/nextjs'; // 1. Import Clerk's auth hook

export default function ActiveParkingTable() {
  const { getToken, isSignedIn, isLoaded } = useAuth(); // 2. Destructure auth tools
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
    // Don't execute fetch logic until Clerk has loaded the user state
    if (!isLoaded) return;

    const fetchParkingData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        
        // 3. Retrieve the JWT session token safely from Clerk
        const token = await getToken(); 

        const res = await fetch(`${baseUrl}/api/parking/active`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 4. Send the token to your Next.js backend API
            'Authorization': `Bearer ${token}`, 
          }
        });

        const json = await res.json();
        if (res.ok && json.status === 'success') {
          setVehicles(json.data);
        } else {
          console.error("Unauthorized or bad response from server");
        }
      } catch (error) {
        console.error("Failed to fetch parking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch data if user is signed in
    if (isSignedIn) {
      fetchParkingData();
      
      // 5. Setup live listener to force a secure re-fetch when changes happen
      const channel = supabase.channel('realtime-active-parking');

      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'licenseplate' }, 
        () => {
          console.log('Database change detected! Securely refreshing...'); 
          fetchParkingData();
        }
      );

      channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setIsLoading(false);
    }
    
  }, [isLoaded, isSignedIn, getToken]); // Depend on auth states changing

  // The Ticking Clock: Update the local time every minute to drive the live math
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 
    return () => clearInterval(clockInterval);
  }, []);

  // The Live Fee Calculator Function (Dynamic Rates)
  const calculateFee = (timeIn, timeOut, vehicleType) => {
    const start = new Date(timeIn);
    const end = timeOut ? new Date(timeOut) : currentTime; 
    
    const elapsedMs = end - start;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const billableHours = Math.ceil(elapsedHours);

    const isMotorcycle = vehicleType && vehicleType.toLowerCase().includes('motor');
    const hourlyRate = isMotorcycle ? 15 : 30;
    
    const fee = billableHours * hourlyRate;
    return Math.max(hourlyRate, fee).toFixed(2); 
  };

  const elapsedTime = (timeIn, timeOut) => {
    const start = new Date(timeIn);
    const end = timeOut ? new Date(timeOut) : currentTime; 
    const elapsedMs = Math.max(0, end - start); 
  
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes}m`; 
    return `${hours}h ${minutes}m`; 
  }

  // Handle Authentication Blocking Layout states
  if (!isLoaded || isLoading) {
    return (
      <div className="w-full pt-7 h-[500px] flex flex-col items-center justify-center border border-dashed border-moon/10 rounded-xl">
        <div className="animate-pulse text-moon/70 font-medium">Loading Live Data...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="w-full pt-7 h-[500px] flex flex-col items-center justify-center border border-dashed border-red-500/10 rounded-xl">
        <div className="text-red-400 font-medium">Access Denied: Please sign in as a worker to view this board.</div>
      </div>
    );
  }

  return (
    <div className="w-full pt-7 h-[500px] flex flex-col">
      {/* HEADER */}
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
        <div className="hidden md:grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_100px] gap-x-4 px-3.5 pb-2 shrink-0">
          {["Plate", "Type", "Date", "Time In", "Elapsed", "Fee"].map((h, i) => (
            <span key={h} className={`text-[11px] font-semibold pr-4.5 uppercase tracking-widest text-slate-400 ${i === 5 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* LIST */}
      <div className="space-y-px overflow-y-auto flex-1 pr-2 custom-scrollbar">
        {vehicles.length === 0 ? (
          <div className="py-10 text-center text-slate-400 italic text-sm">
            Lot is currently empty.
          </div>
        ) : (
          vehicles.map((car, idx) => (
            <div key={idx}>
              {/* DESKTOP ROW */}
              <div className="hidden md:grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px] gap-x-4 items-center px-3.5 py-2.5 rounded-lg border border-transparent hover:bg-slate/10 hover:border-moon/5 transition-colors group cursor-default">
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

              {/* MOBILE ROW */}
              <div className="md:hidden grid grid-cols-[1fr_auto] gap-x-3 items-start px-3 py-3 rounded-lg border border-transparent hover:bg-slate/10 hover:border-moon/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-moon tracking-wide">
                    {car.plate_number}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${getVehicleType(car.vehicle_type)}`}>
                    {car.vehicle_type}
                  </span>
                </div>
                
                <span className="text-sm font-bold text-green-400 text-right">
                  ₱{calculateFee(car.time_in, car.time_out, car.vehicle_type)}
                </span>
                
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-moon/80">
                    In: {new Date(car.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-ocean text-xs">·</span>
                  <span className="text-xs text-moon/80">
                    Elapsed: {elapsedTime(car.time_in, car.time_out)}
                  </span>
                </div>
                
                <div className="flex justify-end mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${getBadgeClass(car.status)}`}>
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