'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// CONFIGURATION
const CONFIDENCE_THRESHOLD = 90; // Minimum score to trigger auto-approve
const AUTO_APPROVE_DELAY_MS = 180000; // 3 mins

export default function EntranceApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now()); 
  const { user } = useUser();
  const autoApprovingRefs = useRef(new Set());

  // --- NEW STATE FOR MANUAL ENTRY ---
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualPlate, setManualPlate] = useState("");
  const [manualVehicleType, setManualVehicleType] = useState("Car");

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

  const denyApprove = async (id, currentPlate, vehicleType, confidenceScore) => {
    // 1. Ask for confirmation before proceeding
    const isConfirmed = window.confirm(
      `Are you sure you want to deny entrance for plate: ${currentPlate || "this vehicle"}?`
    );
    
    // 2. If the user clicks "Cancel", stop the function here
    if (!isConfirmed) {
      return; 
    }

    const uppercasePlate = (currentPlate || "").toUpperCase();

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/parking/deny/entrance`, {
        method: 'DELETE', 
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
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Denial failed", error);
    }
  };

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

  // --- NEW: Submit Manual Entry ---
  const handleManualSubmit = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to approve entrance this vehicle?`
    );
    
    // 2. If the user clicks "Cancel", stop the function here
    if (!isConfirmed) {
      return; 
    }

    if (!manualPlate.trim()) {
      alert("Please enter a plate number.");
      return;
    }

    // Generate a temporary ID. Your backend will attempt to delete this from 
    // pendingplate (which will safely do nothing) and then add it to licenseplate.
    const tempId = "00000000-0000-0000-0000-000000000000";
    
    // We pass 100 as the confidence score since a human verified it
    await handleApprove(tempId, manualPlate, manualVehicleType, 100);

    // Reset and close the form
    setManualPlate("");
    setManualVehicleType("Car");
    setShowManualForm(false);
  };

  return (
    <div className="p-4 bg-ocean/30 rounded-xl shadow-sm border border-ocean">
{/* --- RESPONSIVE HEADER --- */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <h2 className="text-base sm:text-lg font-bold text-ocean-light flex items-center gap-1.5 sm:gap-2">
          <LogIn className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-ocean-light flex-shrink-0"/> 
          <span className="truncate">Arriving Cars</span>
        </h2>
        <button 
          onClick={() => setShowManualForm(!showManualForm)}
          className="bg-ocean hover:bg-ocean-dark text-moon font-bold py-1 px-2 sm:px-3 rounded text-xs sm:text-sm transition whitespace-nowrap"
        >
          {showManualForm ? "Cancel" : "+ Manual"}
        </button>
      </div>

      {/* --- RESPONSIVE MANUAL ENTRY FORM --- */}
      {showManualForm && (
        <div className="bg-ocean/50 p-2 sm:p-3 rounded mb-3 sm:mb-4 border border-ocean-dark flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="PLATE #"
            value={manualPlate}
            onChange={(e) => setManualPlate(e.target.value.toUpperCase())}
            className="uppercase border-2 font-bold border-ocean-dark rounded px-2 py-1.5 sm:py-1 text-sm text-moon-light focus:outline-none focus:border-blue-500 w-full sm:flex-1 bg-transparent"
          />
          <select
            value={manualVehicleType}
            onChange={(e) => setManualVehicleType(e.target.value)}
            className="border-2 border-ocean-dark rounded px-2 py-1.5 sm:py-1 text-sm text-moon-light font-semibold focus:outline-none bg-slate-800 w-full sm:w-auto"
          >
            <option value="Car">Car</option>
            <option value="Motor">Motor</option>
          </select>
          <button
            onClick={handleManualSubmit}
            className="bg-go hover:bg-go/70 text-white font-bold py-1.5 sm:py-1 px-4 rounded transition text-sm w-full sm:w-auto"
          >
            Submit
          </button>
        </div>
      )}

      
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
                  <div className='flex flex-row gap-2'>
                  <button 
                    onClick={() => handleApprove(car.id, car.raw_plate_read, car.vehicle_type, car.confidence_score)}
                    className="bg-ocean hover:bg-ocean-dark text-moon font-bold py-2 px-2 rounded text-xs transition"
                  >
                    Approve
                  </button>
                  <button 
                  onClick={() => denyApprove(car.id, car.raw_plate_read, car.vehicle_type, car.confidence_score)}
                  className='bg-cherry-dark hover:bg-cherry text-moon font-bold py-2 px-2 rounded text-xs transition'
                >
                  x 
                </button>
                  </div>
                  
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