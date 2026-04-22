'use client';

import { redirect } from "next/navigation";
import { useAuth, useOrganization } from '@clerk/nextjs';


export default function Page() {
  // 1. Grab the auth state
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const { organization } = useOrganization();
  const orgName = organization?.name?.toLowerCase();

  // 2. VERY IMPORTANT: Wait for Clerk to figure out if the user exists
  // If we don't do this, it might redirect them before checking their token!
  if (!isAuthLoaded) {
    return null; // Or return a <p>Loading...</p> spinner
  }

  if (orgName !== 'admin') {
    console.log("Not logged in, redirecting...");
    redirect("/auth/login");
  }

  // If they make it past the checks above, they are legally logged in!
  return (
    <>
      <h1>Admin panel</h1>
    </>
    
  );
}