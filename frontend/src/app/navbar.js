'use client'; // Required if using React hooks like useTheme

import { Show, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="flex items-center px-4 sm:px-6 h-14 border-b border-gray-200">

      {/* Right Side Actions - Added 'ml-auto' here to push it to the right */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">

        {/* Authentication Buttons */}
        <Show when="signed-out">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/auth/login" 
              className="bg-gray-200  text-gray-800 hover:opacity-90 transition-opacity rounded-full font-medium text-xs sm:text-sm h-8 sm:h-9 px-4 flex items-center justify-center"
            >
              Login
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-purple-700 hover:bg-purple-800 text-white transition-colors rounded-full font-medium text-xs sm:text-sm h-8 sm:h-9 px-4 flex items-center justify-center"
            >
              Sign Up
            </Link>
          </div>
        </Show>

        {/* User Profile */}
        <Show when="signed-in">
          <div className="flex items-center h-8 sm:h-9">
            <UserButton afterSignOutUrl="/" />
          </div>
        </Show>

      </div>
    </header>
  );
}