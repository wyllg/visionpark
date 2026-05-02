'use client';

import React from 'react'
import { useUser, useAuth, useOrganization } from '@clerk/nextjs';

export default function Profile() {

  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { organization } = useOrganization();

  return (
    <>

      <div className="p-6 rounded-lg shadow-md border border-gray-200 bg-white">
            {/* <h2 className="text-2xl font-bold text-purple-700 mb-4">WELCOME</h2> */}
            <div className="flex flex-col gap-2 text-gray-700">
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName} | <strong>Organization:</strong> {organization ? organization.name : "User"}</p>
              <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
      
    </>
  )
}
