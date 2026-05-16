import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from "./navbar";
import Footer from "./footer";

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
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
