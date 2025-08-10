'use client'

import Link from 'next/link'
import React, { useEffect } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import { useRef } from 'react'

const HeroSection = () => {
     const imageRef=useRef()

     useEffect(() => { 
            const imageElement = imageRef.current;
            const handleScroll=()=>{
                const scrollPosition=window.scrollY
                const scrollThreshold=100;
                if(scrollPosition>scrollThreshold){
                     imageElement.classList.add('scrolled');
                }
                else{
                     imageElement.classList.remove('scrolled');
                }
            }
            window.addEventListener('scroll',handleScroll);
            return()=>window.removeEventListener('scroll',handleScroll)
     }, [])

  return (
    <div className='pb-20 px-4'>
    <div className='container mx-auto flex flex-col items-center justify-center text-center pt-20'>
        <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title'>Manage Your Finanaces <br/> with Intelligence</h1>
        <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            An AI-Powered financial management platform that helps you track your expenses, set budgets, and achieve your financial goals effortlessly.
        </p>
        <div>
          <Link href='/dashboard'>
            <Button className='px-8' size='lg'>
              Get Started
            </Button>
          </Link>
        </div>
        <div className='hero-image-wrapper'>
            <div ref={imageRef} className='hero-image'>
                <Image src='/banner.jpeg' 
                width={1280}
                height={720}
                alt='Dashboard Preview'
                className='rounded-lg shadow-2xl border mx-auto'
                priority/>
            </div>
        </div>
    </div>
    </div>
  )
}

export default HeroSection