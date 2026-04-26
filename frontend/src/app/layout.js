import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from "./navbar";

export const metadata = {
  title: "VisionPark",
  description: "-W",
  icons: {
    icon: '/vercel.svg',
  },
};

// { children } renders page.js
export default function RootLayout({ children }) {

  return (
    <html lang="en">
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
