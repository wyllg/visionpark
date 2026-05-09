'use client'; // Required if using React hooks like useTheme

import { Show, UserButton, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="p-2">

      <div className="flex flex-col items-end justify-center">

        {/* LOGIN AND SIGNUP */}
        <Show when="signed-out">
          <div className="flex gap-3 p-2">
            <Link 
              href="/auth/login" 
              className="bg-slate py-1.5 px-5 rounded-xl hover:scale-102 active:scale-98 active:brightness-75"
            >
              Login
            </Link>
            <Link 
              href="/auth/signup" 
              className="gradient-oceancherry py-1.5 px-5 rounded-xl transition-all hover:scale-102 active:scale-98 active:brightness-75"
            >
              Sign Up
            </Link>
          </div>
        </Show>

        {/* LOGOUT */}
        <Show when="signed-in">
          <div className="flex gap-3 p-2 items-center">

            <SignOutButton
              className="gradient-oceancherry py-1.5 px-5 rounded-xl transition-all hover:scale-102 active:scale-98 active:brightness-75">
              Logout
            </SignOutButton>

            <div className="pt-1 sm:pr-3">
              <UserButton afterSignOutUrl="/" />
            </div>
            
          </div>
        </Show>

      </div>
    </header>
  );
}