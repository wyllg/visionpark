'use client';

import { useState, useEffect } from 'react';

export default function ExitedParkingTable() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch the EXITED data from FastAPI
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        // Pointing to your exited endpoint
        const res = await fetch('http://localhost:8000/api/parking/exited');
        const json = await res.json();
        if (json.status === 'success') {
          setVehicles(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch exited parking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParkingData();
    const dbInterval = setInterval(fetchParkingData, 30000);
    return () => clearInterval(dbInterval);
  }, []);

  // 2. A simplified Elapsed Time calculator (No live clock needed!)
  const elapsedTime = (timeIn, timeOut) => {
    if (!timeOut) return '--'; // Safety check
    
    const start = new Date(timeIn);
    const end = new Date(timeOut);
    
    const elapsedMs = Math.max(0, end - start);
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Archive...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">PARKING HISTORY (EXITED)</h2>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
          <tr>
            <th className="p-4 font-semibold">License</th>
            <th className="p-4 font-semibold">Time In</th>
            <th className="p-4 font-semibold">Time Out</th>
            <th className="p-4 font-semibold">Total Time</th>
            <th className="p-4 font-semibold text-right">Amount Paid (PHP)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-gray-500">No cars have exited yet.</td>
            </tr>
          ) : (
            vehicles.map((car, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-800">{car.plate_number}</td>
                <td className="p-4 text-gray-600">{new Date(car.time_in).toLocaleTimeString()}</td>
                {/* Now displaying the exact checkout time */}
                <td className="p-4 text-gray-600">{new Date(car.time_out).toLocaleTimeString()}</td>
                <td className="p-4 text-gray-600 font-medium">{elapsedTime(car.time_in, car.time_out)}</td>
                <td className="p-4 text-right font-mono font-bold text-green-700 text-lg">
                  {/* Using the pre-calculated total_fee directly from Supabase! */}
                  ₱{car.total_fee?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}