import ActiveStrip from '@/app/component/dashboard-component/ActiveStrip'
import CircleCharts from '@/app/component/dashboard-component/CircleCharts'
import DataCharts from '@/app/component/dashboard-component/DataCharts'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <>
      <div className='min-h-screen lg:ml-20 bg-[#F4F6F8] px-2 sm:px-3 md:px-4'>
        <Link href="/boards" className='block text-sm text-gray-500 gap-1 pt-2 sm:pt-3 md:pt-4' >
          <ActiveStrip />
        </Link>

        <div className='w-full max-w-[1700px] mx-auto py-4 sm:py-6 md:py-8 lg:py-10 px-1 sm:px-2 md:px-3 mb-8 sm:mb-10 md:mb-12'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6'>
            <div className="lg:col-span-2">
              <DataCharts />
            </div>
            <div className="lg:col-span-1">
              <CircleCharts />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default page