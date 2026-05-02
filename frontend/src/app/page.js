'use client';

import { useUser, useAuth, useOrganization } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';
import ActiveParkingTable from './components/ActiveParkingTable';
import ExitedParkingTable from './components/ExitedParkingTable';
import EntranceApproval from './components/EntranceApproval';
// import ExitApproval from './components/ExitApproval';
import Profile from './components/Profile';
import Hero from './components/Hero';

export default function YourComponent() {
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { isLoaded: isUserLoaded } = useUser();
  const { organization } = useOrganization();
  const orgName = organization?.name?.toLowerCase();

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleCarApproved = () => {
    setRefreshTrigger(prev => prev + 1);
  }

  // Error Handling and Loading Component
  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <div className="text-lg font-medium text-purple-700 animate-pulse">
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
          <div>
            <Profile />
          </div>

          {/* IF ADMIN */}
          {orgName === 'admin' && (
            <div className="p-6 rounded-lg shadow-md border border-red-200 bg-red-50 text-red-800">
              <h2 className="font-bold text-lg hover:text-blue-700">
                <Link href="/pages/admin">
                  ADMIN PAGE
                </Link>
              </h2>
              <p>Management analytics and audit trails go here.</p>

            </div>
            
          )}

          {/* IF WORKER */}
          {orgName === 'worker' && (
            <>
              <div className="p-6 rounded-lg shadow-md border border-blue-200 bg-blue-50 text-blue-800">
                <h2 className="font-bold text-lg">WORKER VIEW</h2>
              </div>
              <EntranceApproval onApprove={handleCarApproved}/>
              {/* <ExitApproval /> */}
            </>
          )}
        </>
      )}

      {/* ANYONE CAN VIEW */}
      <ActiveParkingTable refreshTrigger={refreshTrigger} />
      <ExitedParkingTable />
    </div>
  );
}