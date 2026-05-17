'use client';
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import React from 'react';
import { UserStar, Download, Car, DollarSign, Users, LogOut } from 'lucide-react';
import { supabase } from "../../lib/supabase";

export default function AdminPanel() {
  const { isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [stats, setStats] = useState({
    activeWorker: "No Active Shift",
    todaysRevenue: 0,
    activeCars: 0,
    todaysExits: 0
  });

  const fetchAdminData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}/api/admin/stats`);
      const json = await res.json();
        
      if (json.status === 'success') {
        setStats(json.data);
        console.log("Fetched");
      }
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    
    fetchAdminData();
    
    const channel = supabase.channel('realtime-admin-data');

    channel.on(
      'postgres_changes',
      {event: '*', schema: 'public', table: 'licenseplate'},
      (payload) => {
        console.log('Global database change detected! Refreshing Worker Table');
        fetchAdminData();
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  // --- REUSABLE CSV EXPORT LOGIC ---
  const downloadCSV = async (endpoint, filenamePrefix) => {
    setExporting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const res = await fetch(`${baseUrl}${endpoint}`);
      const json = await res.json();

      if (json.status === 'success' && json.data.length > 0) {
        // Automatically extract column headers from the first row of data
        const headers = Object.keys(json.data[0]);
        const csvRows = [headers.join(",")]; 

        json.data.forEach(row => {
          const values = headers.map(header => {
            const val = row[header] === null ? "" : row[header];
            // Escape quotes and wrap in quotes for Excel safety
            return `"${String(val).replace(/"/g, '""')}"`; 
          });
          csvRows.push(values.join(","));
        });

        // Trigger browser download
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${filenamePrefix}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert("No data found to export.");
      }
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to download CSV.");
    } finally {
      setExporting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="p-8 text-center animate-pulse text-moon">Loading Admin Panel</div>
    );
  }

  return (
    <div className="w-full pt-4">
        {/* Header with Export Buttons */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-moon/10 mb-4 gap-4">
          <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-moon">
            <UserStar className="w-4.5 h-4.5 text-go flex-shrink-0" />
            Admin Dashboard
          </h2>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => downloadCSV('/api/admin/export/licenseplate', 'VisionPark_Plates')}
              disabled={exporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-ocean hover:bg-ocean-light text-white text-sm font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Plate Data
            </button>
            <button 
              onClick={() => downloadCSV('/api/admin/export/workershift', 'VisionPark_Shifts')}
              disabled={exporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-mustard hover:bg-mustard-light text-white text-sm font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Shift Data
            </button>
          </div>
        </div>

        {/* Admin Content Area - 4 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-ocean/20 rounded-xl border border-ocean/50 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-moon-light font-semibold mb-2">
              <Users className="w-4 h-4 text-mustard" /> Current Worker
            </div>
            <p className="text-xl text-moon font-bold truncate">
              {stats.activeWorker}
            </p>
          </div>

          <div className="p-4 bg-ocean/20 rounded-xl border border-ocean/50 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-moon-light font-semibold mb-2">
              <DollarSign className="w-4 h-4 text-go" /> Today's Revenue
            </div>
            <p className="text-2xl text-go font-bold">
              ₱{stats.todaysRevenue.toFixed(2)}
            </p>
          </div>
          
          <div className="p-4 bg-ocean/20 rounded-xl border border-ocean/50 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-moon-light font-semibold mb-2">
              <Car className="w-4 h-4 text-mustard" /> Active Vehicles
            </div>
            <p className="text-2xl text-mustard font-bold">
              {stats.activeCars}
            </p>
          </div>
          
          <div className="p-4 bg-ocean/20 rounded-xl border border-ocean/50 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-moon-light font-semibold mb-2">
              <LogOut className="w-4 h-4 text-cherry" /> Vehicles Exited Today
            </div>
            <p className="text-2xl text-cherry font-bold">
              {stats.todaysExits}
            </p>
          </div>
        </div>
    </div>
  );
}