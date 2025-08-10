import React, { Suspense } from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'
// This layout is used for the dashboard page, which is lazy-loaded

 const DashboardLayout = () => {
  return (
    <div className='mt-20'>
        <h1 className='text-6xl font-bold text-center gradient-title mb-4'>Dashboard</h1>

        <Suspense 
             fallback={<BarLoader className="mx-auto" color="#36d7b7" width={"100%"} />}
        >
            <DashboardPage/>
        </Suspense>
        
        
    </div>
  )
}
export default DashboardLayout

