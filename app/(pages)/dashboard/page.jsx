import ActiveStrip from '@/app/component/dashboard-component/ActiveStrip'
import CircleCharts from '@/app/component/dashboard-component/CircleCharts'
import DataCharts from '@/app/component/dashboard-component/DataCharts'
import React from 'react'

const page = () => {
  return (
    <>
      <div className='h-screen lg:ml-20 bg-[#F4F6F8]'>
        <ActiveStrip />
        <div className='w-full max-w-400 mx-auto py-10 px-6 mb-12'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
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