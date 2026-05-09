'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

export default function ExitApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const localEdits = useRef({});
  const { user } = useUser();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('https://visionpark.vercel.app/api/parking/pending/exit');
        const json = await res.json();

        if (json.status === 'success') {
          setPendingCars(
            json.data.map(dbCar => ({
              ...dbCar,
              raw_plate_read: localEdits.current[dbCar.id] ?? dbCar.raw_plate_number,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch pending exits:", error);
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id, plateToApprove) => {
    const uppercasePlate = (plateToApprove || "").toUpperCase();

    try {
      const res = await fetch('https://visionpark.vercel.app/api/parking/approve/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          plate_number: uppercasePlate,
          worker_id: user.fullName || user.firstName
        }),
      });

      const result = await res.json();
      if (result.status === 'success') {
        delete localEdits.current[id];
        setPendingCars(prev => prev.filter(car => car.id !== id));
        if (onApprove) onApprove(); // Refreshes table!
      } else {
        alert(`Checkout Failed: ${result.message}\n(Ensure this exact plate is currently in Active Parking)`);
      }
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleInputChange = (id, newText) => {
    localEdits.current[id] = newText;
    setPendingCars(prev => prev.map(car => car.id === id ? { ...car, raw_plate_number: newText } : car));
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
          {pendingCars.map(car => (
            <div key={car.id} className="bg-cherry/20 p-3 rounded border-l-4 border-cherry-dark/60 shadow flex flex-col gap-3">
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-moon-dark">Time: {new Date(car.detection_time).toLocaleTimeString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-sm font-semibold text-moon-dark">Plate:</span>
                     <input
                      type="text"
                      value={car.raw_plate_number}
                      onChange={(e) => handleInputChange(car.id, e.target.value)}
                      className="uppercase border-2 font-bold border-cherry-dark/70 rounded px-2 py-1 text-moon focus:outline-none focus:border-orange-500 w-32"
                    />
                  </div>
                </div>
                
                {/* Manual Checkout Button */}
                <button 
                  onClick={() => handleApprove(car.id, car.raw_plate_read)}
                  className="bg-cherry hover:bg-cherry-dark text-moon font-bold py-2 px-4 rounded text-sm transition"
                >
                  Approve Exit
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}