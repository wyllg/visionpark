'use client';
import { useState, useEffect, useRef } from 'react';


export default function WorkerApproval() {
  const [pendingCars, setPendingCars] = useState([]);
  const localEdits = useRef({}); // { [id]: plate_number }

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/parking/pending');
        const json = await res.json();

        if (json.status === 'success') {
          setPendingCars(
            json.data.map(dbCar => ({
              ...dbCar,
              // Use the worker's local edit if it exists, otherwise use DB value
              plate_number: localEdits.current[dbCar.id] ?? dbCar.plate_number,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch pending cars:", error);
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id, currentPlate) => {

    const uppercasePlate = currentPlate.toUpperCase()
    try {
      const res = await fetch('http://localhost:8000/api/parking/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, corrected_plate: uppercasePlate }),
      });

      const result = await res.json();
      if (result.status === 'success') {
        delete localEdits.current[id]; // Clean up the saved edit
        setPendingCars(prev => prev.filter(car => car.id !== id));
      }
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleInputChange = (id, newText) => {
    localEdits.current[id] = newText; // Save to ref so it survives the 5s polling
    setPendingCars(prevCars => 
      prevCars.map(car => 
        car.id === id ? { ...car, plate_number: newText } : car
      )
    );
  };

  return (
    <div className="p-6 bg-yellow-50 rounded-xl">
      <h2 className="text-xl font-bold text-yellow-800 mb-4">Action Required: Approve Arrivals</h2>
      
      {pendingCars.length === 0 ? (
        <p className="text-gray-500">No new cars waiting for approval.</p>
      ) : (
        <div className="space-y-4">
          {pendingCars.map(car => (
            <div key={car.id} className="bg-white p-4 rounded shadow flex items-center justify-between border-l-4 border-yellow-400">
              
              <div>
                <p className="text-sm text-gray-500">Arrived at: {new Date(car.time_in).toLocaleTimeString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-gray-700">AI Guess:</span>
                  {/* The editable text box! */}
                  <input
                    type="text"
                    value={car.plate_number}
                    onChange={(e) => handleInputChange(car.id, e.target.value)}
                    className="uppercase border font-bold border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              <button 
                onClick={() => handleApprove(car.id, car.plate_number)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow"
              >
                Approve & Publish
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}