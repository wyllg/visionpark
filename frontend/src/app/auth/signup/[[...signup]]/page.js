import { SignUp } from '@clerk/nextjs'
import React from 'react'

export default function Page() {
  return (
    <div className='flex flex-col h-100'>
      <div className='m-auto'>
        <SignUp />
      </div>
    </div>
  )
}
