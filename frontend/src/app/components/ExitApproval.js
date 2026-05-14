'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ExitApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const [activeCars, setActiveCars] = useState([]); // <-- NEW: Stores active cars for live matching
  const { user } = useUser();

  useEffect(() => {
    // Fetch pending exits
    const fetchPending = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/parking/pending/exit`);
        const json = await res.json();

        if (json.status === 'success') {
          setPendingCars(prevCars => {
            return json.data.map(dbCar => {
              const existingCar = prevCars.find(c => c.id === dbCar.id);
              const databasePlate = dbCar.raw_plate_number || dbCar.plate_number || "";
              return {
                ...dbCar,
                raw_plate_read: existingCar ? existingCar.raw_plate_read : databasePlate,
              };
            });
          });
        }
      } catch (error) {
        console.error("Failed to fetch pending exits:", error);
      }
    };

    // Fetch active parking so we can calculate fees live
    const fetchActive = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/parking/active`);
        const json = await res.json();
        if (json.status === 'success') setActiveCars(json.data);
      } catch (error) {
        console.error("Failed to fetch active parking:", error);
      }
    };

    fetchPending();
    fetchActive();

    // Listeners
    const pendingChannel = supabase
      .channel('realtime-exits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pendingplate' }, () => {
        fetchPending();
      }).subscribe();

    const activeChannel = supabase
      .channel('realtime-active-for-exits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'licenseplate' }, () => {
        fetchActive();
      }).subscribe();

    return () => {
      supabase.removeChannel(pendingChannel);
      supabase.removeChannel(activeChannel);
    };

  }, []);

  // Helper function to calculate the fee live while they type!
  const calculateLiveFee = (timeIn, vehicleType) => {
    const start = new Date(timeIn);
    const end = new Date();
    const elapsedMs = Math.max(0, end - start);
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const billableHours = Math.max(1, Math.ceil(elapsedHours));
    
    const isMotor = vehicleType && vehicleType.toLowerCase().includes('motor');
    const hourlyRate = isMotor ? 15 : 30;
    
    return (billableHours * hourlyRate).toFixed(2);
  };

  const handleApprove = async (id, plateToApprove) => {
    const cleanPlate = (plateToApprove || "").toUpperCase().trim();

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/parking/approve/exit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          plate_number: cleanPlate, // Sent clean
          worker_id: user?.fullName || user?.firstName || "Unknown Worker",
        }),
      });

      const result = await res.json();
      if (result.status === 'success') {
        // 1. Remove from screen
        setPendingCars(prev => prev.filter(car => car.id !== id));
        if (onApprove) onApprove(); 
        
        // 2. Final Success Popup Alert
        alert(`✅ CHECKOUT SUCCESS!\n\nPlate: ${cleanPlate}\nCollected: ₱${result.fee}\n\nPlease open the gate.`);
      } else {
        alert(`Checkout Failed: ${result.message || JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleInputChange = (id, newText) => {
    setPendingCars(prev => prev.map(car => car.id === id ? { ...car, raw_plate_read: newText } : car));
  };

  return (
    <div className="p-4 bg-cherry/20 rounded-xl shadow-sm border border-cherry/70">
      <h2 className="text-lg font-bold text-cherry-light mb-3 flex items-center gap-2">
        <LogOut className="w-4.5 h-4.5 text-cherry-light flex-shrink-0"/> Exiting Cars
      </h2>
      
      {pendingCars.length === 0 ? (
        <p className="text-slate-300 text-sm">No pending exits.</p>
      ) : (
        <div className="space-y-3">
          {pendingCars.map(car => {
            // Live matching logic
            const cleanInput = (car.raw_plate_read || "").toUpperCase().trim();
            const matchedActiveCar = activeCars.find(a => a.plate_number.toUpperCase().trim() === cleanInput);

            return (
              <div key={car.id} className="bg-cherry/20 p-3 rounded border-l-4 border-cherry-dark/60 shadow flex flex-col gap-3">
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-moon-dark">Time: {new Date(car.detection_time).toLocaleTimeString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-sm font-semibold text-moon-dark">Plate:</span>
                       <input
                        type="text"
                        value={car.raw_plate_read}
                        onChange={(e) => handleInputChange(car.id, e.target.value)}
                        className={`uppercase border-2 font-bold rounded px-2 py-1 text-moon focus:outline-none w-32 ${matchedActiveCar ? 'border-ocean focus:border-go' : 'border-mustard focus:border-cherry-dark'}`}
                      />
                    </div>
                  </div>
                  
                  {/* Smart Checkout Button */}
                  <button 
                    disabled={!matchedActiveCar} // Locks the button until a match is found!
                    onClick={() => handleApprove(car.id, car.raw_plate_read)}
                    className={`font-bold py-2 px-4 rounded text-sm transition ${matchedActiveCar ? 'bg-ocean hover:bg-ocean-dark text-moon shadow-lg' : 'bg-cherry/50 text-moon/40 cursor-not-allowed'}`}
                  >
                    Checkout
                  </button>
                </div>

                {/* THE NEW LIVE MATCH UI */}
                {matchedActiveCar ? (
                  <div className="p-2.5 bg-ocean/40 border border-ocean/70 rounded-md flex justify-between items-center">
                    <span className="text-xs text-ocean-light font-bold flex items-center gap-1.5">
                      ✓ Active Match 
                      <span className="bg-ocean/50 px-1.5 py-0.5 rounded border border-ocean/70 uppercase text-[10px]">
                        {matchedActiveCar.vehicle_type || 'Car'}
                      </span>
                    </span>
                    <span className="text-ocean-light tracking-wide">
                      ₱{calculateLiveFee(matchedActiveCar.time_in, matchedActiveCar.vehicle_type)}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-mustard/20 border border-mustard/40 rounded-md">
                    <span className="text-xs text-yellow-400/80 font-medium">Type to find exact match in Active Parking...</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}