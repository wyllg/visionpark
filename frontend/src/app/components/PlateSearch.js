'use client';

import { useState } from 'react';
import { Search, Car, Clock, AlertCircle, Banknote, CalendarOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PlateSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // VisionPark Calculation Logic
  const calculateFee = (timeIn, timeOut, vehicleType) => {
    if (!timeIn) return 0;
    
    const start = new Date(timeIn);
    const end = timeOut ? new Date(timeOut) : new Date();
    
    const diffInMs = end - start;
    // Calculate total hours, rounding up to the nearest hour (minimum 1 hour)
    const diffInHours = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60)));
    
    const rate = vehicleType?.toLowerCase() === 'motor' ? 15 : 30;
    return diffInHours * rate;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('licenseplate')
        .select('*')
        .ilike('plate_number', searchQuery.trim())
        .order('time_in', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setResult(data[0]);
      } else {
        setError('No vehicle found with that license plate.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Search Header */}
      <div className="flex flex-col items-center mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-moon mb-1 text-center tracking-wide">
          Find Your Vehicle
        </h2>
        <p className="text-slate-light text-xs sm:text-sm text-center max-w-xs">
          Enter your license plate to check your parking status.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6 group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="w-4 h-4 text-slate-light group-focus-within:text-ocean transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
          placeholder="XXX-1234"
          className="glass-card w-full text-moon text-base py-3 pl-10 pr-28 uppercase tracking-widest focus:outline-none focus:border-ocean focus:ring-1 focus:ring-ocean transition-all placeholder:text-slate-light placeholder:tracking-normal"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute inset-y-1.5 right-1.5 gradient-oceancherry hover:opacity-90 text-moon text-xs sm:text-sm font-bold px-4 rounded transition-opacity disabled:opacity-50"
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-cherry-dark/20 border border-cherry/40 text-cherry-light p-3 rounded-md flex items-center gap-2 text-sm animate-pulse backdrop-blur-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Search Result Card */}
      {result && (
        <div className="glass-card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex justify-between items-start mb-5 pb-4 border-b border-white/5">
            <div>
              <p className="text-slate-light text-[10px] font-bold uppercase tracking-widest mb-1">
                License Plate
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-moon tracking-widest">
                {result.plate_number}
              </h3>
            </div>
            
            <div className={`badge ${
              result.status?.toLowerCase() === 'active' 
                ? 'badge-active' 
                : 'badge-exited'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                result.status?.toLowerCase() === 'active' 
                  ? 'bg-go animate-pulse' 
                  : 'bg-cherry'
              }`}></div>
              {result.status}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            {/* Vehicle Type */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-light mb-0.5">
                <Car className="w-3.5 h-3.5 text-ocean-light" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Type</p>
              </div>
              <p className="text-moon text-sm sm:text-base font-medium capitalize">
                {result.vehicle_type || 'Car'}
              </p>
            </div>

            {/* Parking Fee Calculation */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-light mb-0.5">
                <Banknote className="w-3.5 h-3.5 text-go" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-go">
                  {result.status?.toLowerCase() === 'active' ? 'Current Fee' : 'Amount Paid'}
                </p>
              </div>
              <p className="text-moon text-sm sm:text-base font-medium">
                ₱{calculateFee(result.time_in, result.time_out, result.vehicle_type).toFixed(2)}
              </p>
            </div>

            {/* Time In */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-light mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Time In</p>
              </div>
              <p className="text-moon text-sm sm:text-base font-medium">
                {new Date(result.time_in).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Time Out (Only displays if the car has Exited) */}
            {result.status?.toLowerCase() !== 'active' && result.time_out && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-light mb-0.5">
                  <CalendarOff className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Time Out</p>
                </div>
                <p className="text-moon text-sm sm:text-base font-medium">
                  {new Date(result.time_out).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}