
// WEBSITE NAVBAR FOR LOGGING IN, SIGNING UP, LOGGING OUT AND VIEWING PROFILE

'use client';

import { Show, UserButton, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="p-2">

      <div className="flex flex-col items-end justify-center">

        {/* LOGIN AND SIGNUP, ONLY SHOWS WHEN USER IS SIGNED OUT*/}
        <Show when="signed-out">
          <div className="flex gap-3 p-2">

            {/* REDIRECTS TO /auth/login (LOCATED IN: frontend\src\app\auth\login\[[...login]]\page.js) */}
            <Link 
              href="/auth/login" 
              className="bg-slate py-1.5 px-5 rounded-xl hover:scale-102 active:scale-98 active:brightness-75">
              Login
            </Link>

            {/* REDIRECTS TO /auth/signup (LOCATED IN: frontend\src\app\auth\signup\[[...signup]]\page.js)*/}
            <Link 
              href="/auth/signup" 
              className="gradient-oceancherry py-1.5 px-5 rounded-xl transition-all hover:scale-102 active:scale-98 active:brightness-75">
              Sign Up
            </Link>

          </div>
        </Show>

        {/* LOGOUT, ONLY SHOWED WHEN USER IS SIGNED IN */}
        <Show when="signed-in">
          <div className="flex gap-3 p-2 items-center">

            {/* SignOutButton IS A CLERK HOOK THAT AUTOMATICALLY SIGNS OUT USERS */}
            <SignOutButton
              className="gradient-oceancherry py-1.5 px-5 rounded-xl transition-all hover:scale-102 active:scale-98 active:brightness-75">
              Logout
            </SignOutButton>

            {/* UserButton IS A CLERK COMPONENT THAT SHOWS DETAILS ABOUT THE SIGNED IN USER */}
            {/* IF THE USER SIGNS OUT USING THIS COMPONENT THEY ARE REDIRECTED TO THE HOMEPAGE */}
            <div className="pt-1 sm:pr-3">
              <UserButton afterSignOutUrl="/"/>
            </div>
            
          </div>
        </Show>

      </div>
    </header>
  );
}