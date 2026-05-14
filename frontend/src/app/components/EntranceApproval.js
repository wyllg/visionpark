'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// CONFIGURATION
const CONFIDENCE_THRESHOLD = 85; // Minimum score to trigger auto-approve
const AUTO_APPROVE_DELAY_MS = 15000; // 15 seconds

export default function EntranceApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now()); 
  const { user } = useUser();
  const autoApprovingRefs = useRef(new Set()); 

  // 1. Timer to update the current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Logic
  const fetchPending = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/parking/pending/Entrance`);
      const json = await res.json();

      if (json.status === 'success') {
        setPendingCars(prevCars => {
          return json.data.map(dbCar => {
            const existingCar = prevCars.find(c => c.id === dbCar.id);
            const databasePlate = dbCar.raw_plate_number || dbCar.plate_number || "";

            return {
              ...dbCar,
              raw_plate_read: existingCar ? existingCar.raw_plate_read : databasePlate,
              received_at: existingCar ? existingCar.received_at : Date.now(),
            };
          });
        });
      }
    } catch (error) {
      console.error("Failed to fetch pending entrances:", error);
    }
  };

  // 3. Supabase Realtime Connection
  useEffect(() => {
    fetchPending();

    const channel = supabase
      .channel('realtime-entrances')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pendingplate' }, 
        () => fetchPending()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 4. THE AUTO-APPROVE LOGIC
  useEffect(() => {
    pendingCars.forEach(car => {
      if (car.confidence_score >= CONFIDENCE_THRESHOLD && !autoApprovingRefs.current.has(car.id)) {
        const timeElapsed = currentTime - car.received_at;
        
        if (timeElapsed >= AUTO_APPROVE_DELAY_MS) {
          autoApprovingRefs.current.add(car.id);
          handleApprove(car.id, car.raw_plate_read, car.vehicle_type, car.confidence_score);
        }
      }
    });
  }, [currentTime, pendingCars]);

  // 5. Submit Function
  const handleApprove = async (id, currentPlate, vehicleType, confidenceScore) => {
    const uppercasePlate = (currentPlate || "").toUpperCase();

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/parking/approve/entrance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          plate_number: uppercasePlate, 
          worker_id: user?.fullName || user?.firstName || "Unknown Worker",
          vehicle_type: vehicleType || "Car", 
          confidence_score: confidenceScore || 0
        }),
      });

      const result = await res.json();
      if (result.status === 'success') {
        setPendingCars(prev => prev.filter(car => car.id !== id));
        autoApprovingRefs.current.delete(id); 
        if (onApprove) onApprove(); 
      } else {
        alert(`Failed: ${result.message}`);
        autoApprovingRefs.current.delete(id); 
      }
    } catch (error) {
      console.error("Approval failed", error);
      autoApprovingRefs.current.delete(id);
    }
  };

  return (
    <div className="p-4 bg-ocean/30 rounded-xl shadow-sm border border-ocean">
      <h2 className="text-lg font-bold text-ocean-light mb-3 flex items-center gap-2">
        <LogIn className="w-4.5 h-4.5 text-ocean-light flex-shrink-0"/> Arriving Cars
      </h2>
      
      {pendingCars.length === 0 ? (
        <p className="text-slate-300 text-sm">No pending arrivals.</p>
      ) : (
        <div className="space-y-3">
          {pendingCars.map(car => {
            // Safety checks to ensure we don't crash if database data is missing
            const confidence = car.confidence_score || 0;
            const isHighConfidence = confidence >= CONFIDENCE_THRESHOLD;
            const secondsLeft = Math.max(0, Math.ceil((AUTO_APPROVE_DELAY_MS - (currentTime - car.received_at)) / 1000));

            return (
              <div key={car.id} className="bg-ocean/50 p-3 rounded border-l-4 border-ocean-dark shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* VEHICLE TYPE BADGE */}
                    <span className="bg-slate-700 text-white text-xs px-2 py-0.5 rounded font-semibold tracking-wide">
                      {car.vehicle_type || 'Unknown'}
                    </span>
                    {/* CONFIDENCE SCORE BADGE */}
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      isHighConfidence ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}>
                      {confidence}% Match
                    </span>
                  </div>

                  <p className="text-xs text-moon-dark">Time: {new Date(car.detection_time).toLocaleTimeString()}</p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-moon-dark">Plate:</span>
                    <input
                      type="text"
                      value={car.raw_plate_read}
                      onChange={(e) => {
                        setPendingCars(prev => 
                          prev.map(c => c.id === car.id ? { ...c, raw_plate_read: e.target.value } : c)
                        );
                      }}
                      className="uppercase border-2 font-bold border-ocean-dark rounded px-2 py-1 text-moon-light focus:outline-none focus:border-blue-500 w-32 bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <button 
                    onClick={() => handleApprove(car.id, car.raw_plate_read, car.vehicle_type, car.confidence_score)}
                    className="bg-ocean hover:bg-ocean-dark text-moon font-bold py-2 px-4 rounded text-sm transition"
                  >
                    Approve Arrival
                  </button>
                  
                  {/* COUNTDOWN TEXT */}
                  {isHighConfidence && secondsLeft > 0 && (
                    <span className="text-[10px] text-green-400 font-medium mt-1 animate-pulse">
                      Auto-approving in {secondsLeft}s...
                    </span>
                  )}
                  {isHighConfidence && secondsLeft === 0 && (
                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                      Approving...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}