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
        >
          <style>{`
            @keyframes shimmer-bottom {
              0%   { stroke: #e45b3d; opacity: 0.55; }
              25%  { stroke: #e5873b; opacity: 0.75; }
              50%  { stroke: #3e787b; opacity: 0.55; }
              75%  { stroke: #e45b3d; opacity: 0.8; }
              100% { stroke: #e45b3d; opacity: 0.55; }
            }
            @keyframes shimmer-top {
              0%   { stroke: #eceed5; }
              25%  { stroke: #e45b3d; }
              50%  { stroke: #e5873b; }
              75%  { stroke: #3e787b; }
              100% { stroke: #eceed5; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50%       { transform: translateY(-1.2px); }
            }
            .logo-dbot { animation: shimmer-bottom 4s ease-in-out infinite; }
            .logo-dtop { animation: shimmer-top 4s ease-in-out infinite; animation-delay: -2s; }
            .logo-fgrp { animation: float 4s ease-in-out infinite; transform-origin: 12px 12px; }
          `}</style>

          <g className="logo-fgrp">
            <path
              className="logo-dbot"
              d="M12 10L4 15L12 20L20 15L12 10Z"
              stroke="#e45b3d"
              strokeWidth="1.5"
            />
            <path
              className="logo-dtop"
              d="M12 4L4 9L12 14L20 9L12 4Z"
              stroke="#eceed5"
              strokeWidth="1.5"
            />
          </g>
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

