import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/ui/themes'
import React from 'react'

export default function Page({pageProps}) {
  return (
    <div className='flex flex-col h-100'>
      <div className='m-auto'>
        <SignIn 
          appearance={{
            theme: dark,
            elements: {
              formButtonPrimary: "gradient-oceancherry !text-moon !shadow-none",
            }
          }}
          {...pageProps}
        />
      </div>
    </div>
  )
}
