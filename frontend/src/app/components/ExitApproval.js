'use client';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export default function ExitApproval({ onApprove }) {
  const [pendingCars, setPendingCars] = useState([]);
  const localEdits = useRef({});
  const { user } = useUser();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/parking/pending/exit');
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
      const res = await fetch('http://localhost:8000/api/parking/approve/exit', {
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
    <div className="p-4 bg-orange-50 rounded-xl shadow-sm border border-orange-100">
      <h2 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
        📤 Exiting Cars
      </h2>
      
      {pendingCars.length === 0 ? (
        <p className="text-gray-500 text-sm">No pending exits.</p>
      ) : (
        <div className="space-y-3">
          {pendingCars.map(car => (
            <div key={car.id} className="bg-white p-3 rounded border-l-4 border-orange-400 shadow flex flex-col gap-3">
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Time: {new Date(car.detection_time).toLocaleTimeString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-sm font-semibold text-gray-600">AI Read:</span>
                     <input
                      type="text"
                      value={car.raw_plate_number}
                      onChange={(e) => handleInputChange(car.id, e.target.value)}
                      className="uppercase border-2 font-bold border-gray-200 rounded px-2 py-1 text-gray-800 focus:outline-none focus:border-orange-500 w-32"
                    />
                  </div>
                </div>
                
                {/* Manual Checkout Button */}
                <button 
                  onClick={() => handleApprove(car.id, car.raw_plate_read)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded text-sm transition"
                >
                  Manual Checkout
                </button>
              </div>

              {/* THE MAGIC QUICK CHECKOUT UI (Triggered if Fuzzy Match was 55% - 84%) */}
              {car.suggested_match && (
                <button 
                  onClick={() => handleApprove(car.id, car.suggested_match)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition animate-pulse"
                >
                  <span>🎯</span> Quick Checkout: {car.suggested_match}
                </button>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}