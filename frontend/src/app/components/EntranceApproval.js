'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';

export default function EntranceApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/parking/pending/entrance`);
        const json = await res.json();

        if (json.status === 'success') {
          // Use 'prevCars' to merge the new database data with your local typing!
          setPendingCars(prevCars => {
            return json.data.map(dbCar => {
              // 1. Check if this specific car is already on the screen
              const existingCar = prevCars.find(c => c.id === dbCar.id);
              
              // 2. Grab the plate from the DB (Checking both possible column names just in case)
              const databasePlate = dbCar.raw_plate_number || dbCar.plate_number || "";

              return {
                ...dbCar,
                // 3. If the car is already on screen, preserve the 'raw_plate_read' the worker is currently typing. 
                // If it's a new arrival, use the database's guess.
                raw_plate_read: existingCar ? existingCar.raw_plate_read : databasePlate,
              };
            });
          });
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
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/parking/approve/entrance`, {
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
        // Remove it cleanly from the screen
        setPendingCars(prev => prev.filter(car => car.id !== id));
        if (onApprove) onApprove(); 
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleInputChange = (id, newText) => {
    // Simply update the React state. The fetch loop will respect this change now!
    setPendingCars(prev => 
      prev.map(car => car.id === id ? { ...car, raw_plate_read: newText } : car)
    );
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