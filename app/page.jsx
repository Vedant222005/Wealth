import HeroSection from '@/components/hero';
import { Button } from '@/components/ui/button';
import { statsData, featuresData,  howItWorksData, testimonialsData } from '@/data/landing';
import Link from 'next/link';
export default function Home() {
  return (
    <div className='mt-20'>
      <HeroSection />
      <section className='py-20 bg-blue-50'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
             {statsData.map((stat, index) => (
              <div key={index} className='text-center mb-8'>
                <div className='text-4xl font-bold text-blue-600 mb-2'>{stat.value}</div>
                <div className='text-lg text-gray-600'>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='py-20'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12'>Why Choose Our Platform?</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {featuresData.map((feature, index) => (
              <div key={index} className='bg-white p-8 rounded-lg shadow-md text-center h-64 flex flex-col justify-center'>
                <div className='flex justify-center mb-6'>{feature.icon}</div>
                <div className='text-xl font-semibold mb-4'>{feature.title}</div>
                <p className='text-gray-600'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className='py-20 bg-blue-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12'>How It Works?</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {howItWorksData.map((work, index) => (
              <div key={index} className='bg-white p-8 rounded-lg shadow-md text-center h-64 flex flex-col justify-center'>
                <div className='flex justify-center mb-6'>{work.icon}</div>
                <div className='text-xl font-semibold mb-4'>{work.title}</div>
                <p className='text-gray-600'>{work.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='py-20'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12'>Testimonials</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {testimonialsData.map((test, index) => (
              <div key={index} className='bg-white p-10 rounded-lg shadow-md text-center h-80 flex flex-col justify-center'>
                <img src={test.image} alt={test.name} className='w-24 h-24 rounded-full mx-auto mb-4' />
                <div className='text-xl font-semibold mb-2'>{test.name}</div>
                <div className='text-sm text-gray-500 mb-4'>{test.role}</div>
                <p className='text-gray-600'>{test.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       <section className='py-20 bg-blue-600 text-white'>
        <div className='container mx-auto px-4 text-center '>
          <h2 className='text-3xl font-bold text-center mb-4'>Ready to Take Control of Your Finances?</h2>
          <p className='text-lg mb-8'>Join thousands of users who are already managing their finances smarter with WELTH.</p>
          <Link href='/dashboard'>
            <Button className='bg-white text-blue-600 cursor-pointer hover:bg-white animate-bounce ' size='lg'>
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
      
    </div>  
  );
}
