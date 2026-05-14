'use client';

import { useUser, useAuth, useOrganization } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';
import ActiveParkingTable from './components/ActiveParkingTable';
import ExitedParkingTable from './components/ExitedParkingTable';
import WorkerShift from './components/WorkerShift';
import Hero from './components/Hero';
import AdminPanel from './components/AdminPanel';

export default function YourComponent() {
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { isLoaded: isUserLoaded } = useUser();
  const { organization } = useOrganization();
  const orgName = organization?.name?.toLowerCase();

  // const [refreshTrigger, setRefreshTrigger] = useState(0);
  // const handleCarApproved = () => {
  //   setRefreshTrigger(prev => prev + 1);
  // }
  

  // Error Handling and Loading Component
  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-xl font-medium text-mustard animate-pulse">
          Loading VisionPark
        </div>
      </div>
      
    );
  }

  return (
    <div className="p-5 max-w-screen">
      <Hero />

      {/* IF LOGGED IN */}
      {userId && (
        <>

          {/* IF ADMIN */}
          {orgName === 'admin' && (
            <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
              <AdminPanel />
            </div>

            
          )}

          {/* IF WORKER */}
          {orgName === 'worker' && (
            <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
              <WorkerShift />
            </div>
          )}
        </>
      )}

      {/* ANYONE CAN VIEW */}
      <div className='flex flex-col space-y-4'>
        <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
          <ActiveParkingTable/>
        </div>
        <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
          <ExitedParkingTable/>
        </div>
      </div>

      

    </div>
  );
}