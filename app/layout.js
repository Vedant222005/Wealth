import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter=Inter({subsets: ["latin"]});

export const metadata = {
  title: "Welth - Personal Finance Management",
  description: "A modern personal finance management application with transaction tracking, budget management, and automated alerts",
  icons: {
    icon: '/logo-sm.png',
    shortcut: '/logo-sm.png',
    apple: '/logo-sm.png',
  },
};


export default function RootLayout({ children }) {
  return (
     <ClerkProvider>
    <html lang="en">
      <body className={`${inter.className}`}>

        {/*header*/}
        <Header/>
        
        {/*main content*/}  
        <main className="min-h-screen">{children}</main>
        <Toaster richColors={true} position="top-right"/>

        {/*footer*/}
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600"> 
          <p>{new Date().getFullYear()} Welth. All rights reserved.</p>
          </div>
        </footer>

      </body>
    </html>
    </ClerkProvider>
  );
}
