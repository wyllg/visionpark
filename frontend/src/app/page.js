'use client';

import { useUser, useAuth, useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import LiveParkingTable from './components/LiveParkingTable';

export default function YourComponent() {
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { organization } = useOrganization();
  const orgName = organization?.name?.toLowerCase();

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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-green-900">
        <h2 className="text-xl font-bold mb-2">VisionPark System Status</h2>
        <p>This box is visible to absolutely anyone who visits the page.</p>
      </div>
      <LiveParkingTable />

      {userId && (
        <>
          <div className="p-6 rounded-lg shadow-md border border-gray-200 bg-white">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">WELCOME</h2>
            <div className="flex flex-col gap-2 text-gray-700">
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
              <p><strong>Organization:</strong> {organization ? organization.name : "Standard User"}</p>
            </div>
          </div>

          {orgName === 'admin' && (
            <div className="p-6 rounded-lg shadow-md border border-red-200 bg-red-50 text-red-800">
              <h2 className="font-bold text-lg">ADMIN VIEW</h2>
              <p>Management analytics and audit trails go here.</p>
              <Link className="text-gray-700" href="/pages/admin">
                Admin Page
              </Link>
            </div>
            
          )}

          {orgName === 'worker' && (
            <div className="p-6 rounded-lg shadow-md border border-blue-200 bg-blue-50 text-blue-800">
              <h2 className="font-bold text-lg">WORKER VIEW</h2>
              <p>Error Correction Mode and Shift Handover go here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}