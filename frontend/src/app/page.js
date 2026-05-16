
// MAIN WEBSITE PAGE, RENDERS THE PARKING TABLES AND PANELS FOR WORKER AND ADMIN

'use client';

import { useUser, useAuth, useOrganization } from '@clerk/nextjs';
import ActiveParkingTable from './components/ActiveParkingTable';
import ExitedParkingTable from './components/ExitedParkingTable';
import WorkerShift from './components/WorkerShift';
import Hero from './components/Hero';
import AdminPanel from './components/AdminPanel';
import Footer from "./footer";

export default function YourComponent() {

  // CLERK WEBHOOKS (CLERK IS THE AUTHENTICATION SERVICE, ALLOWS USAGE OF GOOGLE ACCOUNTS FOR SIGNING IN)
  // isLoaded INDICATED WHETHER THE CURRENT AUTHENTICATION STATE IS LOADED BY CLERK (CHECK: https://clerk.com/docs/nextjs/reference/hooks/use-user)
  // useAuth(), useUser(), useOrganization() ARE CLERK WEBHOOKS

  // FETCHES ONLY THE SESSION ID, DOES NOT KNOW ABOUT THE INFO OF THE USER, BASICALLY ONLY ASKS IF THERE IS LOGGED IN ON THE WEBSITE
  const { isLoaded: isAuthLoaded, userId } = useAuth(); 

  // FETCHES THE FULL PROFILE OF THE USER, CAN GET THE ENTIRE USER PROFILE
  const { isLoaded: isUserLoaded, user } = useUser();

  // FETCHES THE ORGANIZATION THE USER BELONGS TO AND TRANSFORMS IT TO LOWERCASE
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const orgName = organization?.name?.toLowerCase();
  
  // ERROR HANDLING AND LOADING COMPONENT
  // IF USER OR ORGANIZATION IS NOT YET LOADED IT WILL SHOW A LOADING SCREEN INSTEAD
  if (!isAuthLoaded || !isUserLoaded || !isOrgLoaded) {
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

      <Hero /> {/* SHOWN FOR EVERY USER, EVEN IF THEY ARE NOT LOGGED IN (IMPORTED FROM: import Hero from './components/Hero';) */}

      {/*
      IF A USER IS LOGGED IN AN IF STATEMENT IS USED, 
      IF A USER IS AN ADMIN: ADMIN PANEL (IMPORTED FROM: import AdminPanel from './components/AdminPanel';) IS SHOWED
      IF A USER IS A WORKER: WORKER PANEL (IMPORTED FROM: import WorkerShift from './components/WorkerShift';) IS SHOWED
      */}

      {/* IF A USER IS LOGGED IN */}
      {userId && ( 
        <>

          {/* IF THE LOGGED IN USER IS AN ADMIN */}
          {orgName === 'admin' && (
            <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
              <AdminPanel/>
            </div>
          )}

          {/* IF THE LOGGED IN USER IS A WORKER */}
          {orgName === 'worker' && (
            <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
              <WorkerShift/>
            </div>
          )}

        </>
      )}

      {/* ANYONE CAN VIEW THIS EVEN IF THEY ARE NOT LOGGED IN */}
      <div className='flex flex-col space-y-4'>
        <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
          <ActiveParkingTable/>
        </div>
        <div className='w-full max-w-6xl mx-auto space-y-6 rounded-3xl pb-5'>
          <ExitedParkingTable/>
        </div>
      </div>

      <Footer />
    </div>
  );
}