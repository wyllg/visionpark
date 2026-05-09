'use client';

import { Show } from '@clerk/nextjs';
import React from 'react'
import { useUser, useAuth } from '@clerk/nextjs';

export default function Hero() {

  const { isLoaded: isUserLoaded, user } = useUser();

  return (
    <div className=''>

      {/* LOGO CONTAINER */}
      <div className="flex flex-col items-center">
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* 1. BOTTOM DIAMOND (Muted/Back layer) */}
          <path 
            d="M12 10L4 15L12 20L20 15L12 10Z" 
            stroke="var(--color-moon)" 
            strokeWidth="1.5" 
            className="opacity-80"
          />

          {/* 2. TOP DIAMOND (Bright/Primary layer) */}
          <path 
            d="M12 4L4 9L12 14L20 9L12 4Z" 
            stroke="var(--color-moon)" 
            strokeWidth="1.5" 
          />
        </svg>
      </div>
    
      {/* TITLE */}
      <div className="flex flex-col items-center justify-center text-5xl pb-4">
        <h1 className="">VisionPark</h1>
      </div>
      
      {/* WELCOME MESSAGE IF LOGGED IN */}
      <Show when="signed-in">
        <div className="pb-4">
          <div className="flex flex-col items-center gap-2 ">
            <p><strong>Hi, </strong> {user?.firstName} {user?.lastName}</p>
          </div>
        </div>
      </Show>

    </div>
  )
}

