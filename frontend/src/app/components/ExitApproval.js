'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ExitApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const [activeCars, setActiveCars] = useState([]); 
  const { user } = useUser();

  // --- NEW STATE FOR MANUAL EXIT ---
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualPlate, setManualPlate] = useState("");

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

  // --- NEW: DENY EXIT LOGIC ---
  const denyApprove = async (id, currentPlate) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to dismiss this exit reading for plate: ${currentPlate || "this vehicle"}?`
    );
    
    if (!isConfirmed) {
      return; 
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/parking/deny/exit`, {
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          plate_number: currentPlate || "Unknown", 
          worker_id: user?.fullName || user?.firstName || "Unknown Worker",
        }),
      });

      const result = await res.json();
      if (result.status === 'success') {
        setPendingCars(prev => prev.filter(car => car.id !== id));
      } else {
        alert(`Failed to dismiss: ${result.message}`);
      }
    } catch (error) {
      console.error("Denial failed", error);
    }
  };

  // --- NEW: Submit Manual Exit ---
  const handleManualSubmit = async () => {
    if (!manualPlate.trim()) return;

    // Use a structurally valid dummy UUID so the backend doesn't crash 
    // when trying to delete from pendingplate.
    const tempId = "00000000-0000-0000-0000-000000000000"; 
    
    await handleApprove(tempId, manualPlate);

    // Reset and close
    setManualPlate("");
    setShowManualForm(false);
  };

  // Live match check for the manual form
  const manualMatchedActiveCar = activeCars.find(
    a => a.plate_number.toUpperCase().trim() === manualPlate.toUpperCase().trim()
  );

  return (
    <div className="p-4 bg-cherry/20 rounded-xl shadow-sm border border-cherry/70">
      
      {/* --- RESPONSIVE HEADER --- */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <h2 className="text-base sm:text-lg font-bold text-cherry-light flex items-center gap-1.5 sm:gap-2">
          <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cherry-light flex-shrink-0"/> 
          <span className="truncate">Exiting Cars</span>
        </h2>
        <button 
          onClick={() => setShowManualForm(!showManualForm)}
          className="bg-cherry/60 hover:bg-cherry text-moon font-bold py-1 px-2 sm:px-3 rounded text-xs sm:text-sm transition whitespace-nowrap"
        >
          {showManualForm ? "Cancel" : "+ Manual"}
        </button>
      </div>

      {/* --- RESPONSIVE MANUAL EXIT FORM --- */}
      {showManualForm && (
        <div className="bg-cherry/20 p-2 sm:p-3 rounded mb-3 sm:mb-4 border border-cherry/50 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="ENTER PLATE #"
              value={manualPlate}
              onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
              className={`uppercase border-2 font-bold rounded px-2 py-1.5 sm:py-1 text-sm text-moon focus:outline-none w-full sm:flex-1 bg-slate-800 ${
                manualMatchedActiveCar ? 'border-ocean focus:border-ocean-light' : 'border-mustard focus:border-cherry-dark'
              }`}
            />
            <button
              disabled={!manualMatchedActiveCar}
              onClick={handleManualSubmit}
              className={`font-bold py-1.5 sm:py-1 px-4 rounded transition text-sm w-full sm:w-auto ${
                manualMatchedActiveCar 
                  ? 'bg-ocean hover:bg-ocean-dark text-moon shadow-lg' 
                  : 'bg-cherry/50 text-moon/40 cursor-not-allowed'
              }`}
            >
              Checkout
            </button>
          </div>

          {/* Smart Live Match UI for Manual Input */}
          {manualMatchedActiveCar ? (
            <div className="p-2.5 bg-ocean/40 border border-ocean/70 rounded-md flex justify-between items-center mt-1">
              <span className="text-xs text-ocean-light font-bold flex items-center gap-1.5">
                ✓ Active Match 
                <span className="bg-ocean/50 px-1.5 py-0.5 rounded border border-ocean/70 uppercase text-[10px]">
                  {manualMatchedActiveCar.vehicle_type || 'Car'}
                </span>
              </span>
              <span className="text-ocean-light tracking-wide font-bold text-sm">
                ₱{calculateLiveFee(manualMatchedActiveCar.time_in, manualMatchedActiveCar.vehicle_type)}
              </span>
            </div>
          ) : (
            <div className="p-2.5 bg-mustard/20 border border-mustard/40 rounded-md mt-1">
              <span className="text-xs text-yellow-400/80 font-medium">Type to find exact match in Active Parking...</span>
            </div>
          )}
        </div>
      )}
      
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
                        className={`uppercase border-2 font-bold rounded px-2 py-1 text-moon focus:outline-none w-32 ${matchedActiveCar ? 'border-ocean focus:border-go' : 'border-mustard focus:border-cherry-dark'} bg-slate-800`}
                      />
                    </div>
                  </div>
                  
                  {/* Smart Checkout & X Button Wrapper */}
                  <div className="flex flex-row gap-2">
                    <button 
                      disabled={!matchedActiveCar} // Locks the button until a match is found!
                      onClick={() => handleApprove(car.id, car.raw_plate_read)}
                      className={`font-bold py-2 px-3 sm:px-4 rounded text-xs sm:text-sm transition ${matchedActiveCar ? 'bg-ocean hover:bg-ocean-dark text-moon shadow-lg' : 'bg-cherry/50 text-moon/40 cursor-not-allowed'}`}
                    >
                      Checkout
                    </button>
                    <button 
                      onClick={() => denyApprove(car.id, car.raw_plate_read)}
                      className='bg-cherry-dark hover:bg-cherry text-moon font-bold py-2 px-3 rounded text-xs sm:text-sm transition'
                    >
                      x 
                    </button>
                  </div>
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