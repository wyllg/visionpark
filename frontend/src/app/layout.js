import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from "./navbar";
import { Space_Mono, Sacramento } from 'next/font/google';

// Configure Space Mono
const spaceMono = Space_Mono({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text!
  variable: '--font-space-mono',
});

// Configure Sacramento
const sacramento = Sacramento({
  weight: '400',
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text!
  variable: '--font-sacramento',
});

export const metadata = {
  title: "VisionPark",
  description: "-W",
  icons: {
    icon: '/svg/logo.svg',
  },
};

// { children } RENDERS page.js
export default function RootLayout({ children }) {

  return (
    <html lang="en" className={`${spaceMono.variable} ${sacramento.variable}`}>
      <head>
      </head>
      <body>
        <ClerkProvider
        afterSignOutUrl="/"
        signInUrl="/auth/login"
        signUpUrl="/auth/signup"
        >
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
