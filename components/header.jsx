import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'
import { checkUser } from '@/lib/checkUser'

const Header = async() => {
     await checkUser();
  return (
    <div className='fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50'>
        <nav className='container mx-auto px-4 py-4 flex items-center justify-between'> 
          <Link href="/">
            <Image src={'/logo.png'}
            alt='welth logo'
            height={60}
            width={200}
            className='h-12 w-auto object-contain cursor-pointer'
            />
          </Link> 

          <div className='flex items-center gap-4'> 
            <SignedOut>
              <SignInButton forceRedirectUrl='/dashboard'>
                 <Button className='cursor-pointer' variant='outline'>Login</Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl='/dashboard'>
                 <Button className='cursor-pointer' variant='outline'>Sign Up</Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <div className='flex items-center gap-3'>
                <Link href='/dashboard'>
                  <Button variant='ghost' className='cursor-pointer flex items-center gap-2'>
                    <LayoutDashboard className='h-4 w-4' />
                    <span className='hidden md:inline'>Dashboard</span>
                  </Button>
                </Link>
                <Link href='/transaction/create'>
                  <Button variant='ghost' className='cursor-pointer flex items-center gap-2'>
                    <PenBox className='h-4 w-4' />
                    <span className='hidden md:inline'>Transaction</span>
                  </Button>
                </Link>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-15 h-15 rounded-full hover:bg-slate-100 transition-colors"
                    }
                  }}
                />

              </div>
            </SignedIn>
          </div>
        </nav>
    </div>
  )
}

export default Header