'use client';

import { useState, useEffect } from 'react';

export default function ActiveParkingTable() {
  const [vehicles, setVehicles] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch the data from FastAPI when the page loads
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/parking/active');
        const json = await res.json();
        if (json.status === 'success') {
          setVehicles(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch parking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParkingData();
    
    // Optional: Auto-refresh the database data every 30 seconds
    const dbInterval = setInterval(fetchParkingData, 3000);
    return () => clearInterval(dbInterval);
  }, []);

  // 2. The Ticking Clock: Update the local time every second to drive the live math
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Ticks every 1 second
    return () => clearInterval(clockInterval);
  }, []);

  // 3. The Live Fee Calculator Function (30 Pesos / Hour)
  const calculateFee = (timeIn, timeOut) => {
    const start = new Date(timeIn);
    // If the car has left, use timeOut. If it is still parked, use the ticking currentTime!
    const end = timeOut ? new Date(timeOut) : currentTime; 
    
    // Calculate elapsed time in hours
    const elapsedMs = end - start;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    
    // Standard parking logic: round UP to the nearest hour (e.g., 1.1 hours = 2 hours)
    // If you want exact decimal billing, remove Math.ceil
    const billableHours = Math.ceil(elapsedHours);
    const fee = billableHours * 30; // 30 PHP per hour
    
    // Minimum fee of 30 PHP
    return Math.max(30, fee).toFixed(2); 
  };

  const elapsedTime = (timeIn, timeOut) => {
    const start = new Date(timeIn);
    // If the car has left, use timeOut. If it is still parked, use the ticking currentTime!
    const end = timeOut ? new Date(timeOut) : currentTime; 
    
    const elapsedMs = Math.max(0, end - start); // Math.max prevents negative time glitches
  
    // 2. Calculate whole hours
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    
    // 3. Calculate remaining whole minutes using the modulo (%) operator
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    // 4. Return a clean, readable string
    if (hours === 0) {
      return `${minutes}m`; // e.g., "45m"
    }
    
    return `${hours}h ${minutes}m`; // e.g., "2h 15m"
  }

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Live Status...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">LIVE PARKING STATUS</h2>
        <span className="text-sm text-gray-500 font-mono">
          System Time: {currentTime.toLocaleTimeString()}
        </span>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
          <tr>
            <th className="p-4 font-semibold">License</th>
            <th className="p-4 font-semibold">Time In</th>
            <th className="p-4 font-semibold">Time Elapsed</th>
            {/* <th className="p-4 font-semibold">Time Out</th> */}
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold text-right">To Be Paid (PHP)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-gray-500">Lot is currently empty.</td>
            </tr>
          ) : (
            vehicles.map((car, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-800">{car.plate_number}</td>
                <td className="p-4 text-gray-600">{new Date(car.time_in).toLocaleTimeString()}</td>
                <td className="p-4 text-gray-600">{elapsedTime(car.time_in, car.time_out)}</td>
                {/* <td className="p-4 text-gray-600">{car.time_out ? new Date(car.time_out).toLocaleTimeString() : '--:--'}</td> */}
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    car.status === 'Active' ? 'bg-green-100 text-green-700' :
                    car.status === 'Needs_Review' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {car.status}
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-bold text-purple-700 text-lg">
                  ₱{calculateFee(car.time_in, car.time_out)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}