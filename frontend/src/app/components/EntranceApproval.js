'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { LogIn, LogInIcon } from 'lucide-react';

export default function EntranceApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const localEdits = useRef({}); // Prevents polling from overwriting typing
  const { user } = useUser();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('/_/backend/api/parking/pending/entrance');
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
        console.error("Failed to fetch pending entrances:", error);
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id, currentPlate) => {
    const uppercasePlate = (currentPlate || "").toUpperCase();

    try {
      const res = await fetch('/_/backend/api/parking/approve/entrance', {
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
        if (onApprove) onApprove(); // Refreshes the Active Parking table!
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleInputChange = (id, newText) => {
    localEdits.current[id] = newText;
    setPendingCars(prev => prev.map(car => car.id === id ? { ...car, raw_plate_read: newText } : car));
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
          {pendingCars.map(car => (
            <div key={car.id} className="bg-ocean/50 p-3 rounded border-l-4 border-ocean-dark shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-moon-dark">Time: {new Date(car.detection_time).toLocaleTimeString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-moon-dark">Plate:</span>
                  <input
                    type="text"
                    value={car.raw_plate_read}
                    onChange={(e) => handleInputChange(car.id, e.target.value)}
                    className="uppercase border-2 font-bold border-ocean-dark rounded px-2 py-1 text-moon-light focus:outline-none focus:border-blue-500 w-32"
                  />
                </div>
              </div>
              <button 
                onClick={() => handleApprove(car.id, car.raw_plate_read)}
                className="bg-ocean hover:bg-ocean-dark text-moon font-bold py-2 px-4 rounded text-sm transition"
              >
                Approve Arrival
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}