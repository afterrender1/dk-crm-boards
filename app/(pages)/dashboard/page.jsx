"use client"
import ActiveStrip from '@/app/component/dashboard-component/ActiveStrip'
import CircleCharts from '@/app/component/dashboard-component/CircleCharts'
import DataCharts from '@/app/component/dashboard-component/DataCharts'
import Link from 'next/link'
import React from 'react'
import { useUser } from '@/app/hooks/useUser'
import { inter, urbanist } from '@/app/fonts'

const page = () => {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  return (
    <>
   <div className ={`${inter.className}`}>
       {user ? (
        <div className="flex py-4 justify-center items-center gap-2">
          <img src={user.image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDrN42gD4QznH0ALl8gtnaR4Xi7X_U1Pvzmg&s'} alt="Avatar" className="w-8 h-8 rounded-full" />
          <span>Welcome {user.name}</span>
        </div>
      ) : (
       <div className='flex justify-center'>
         <Link href={"/login"}  className='active:scale-95 transition-all text-sm text-center my-2 py-2 bg-orange-400 w-90 rounded-lg text-white'>Login to see more details</Link>
       </div>
      )}
   </div>
      <div className='min-h-screen lg:ml-20 bg-[#F4F6F8] px-2 sm:px-3 md:px-4'>
        {
          user ? <Link href="/boards" className='block text-sm text-gray-500 gap-1 pt-2 sm:pt-3 md:pt-4' >
          <ActiveStrip />
        </Link> : <div onClick={()=> {
          alert("Please login first to see boards!")
        }} className='block text-sm text-gray-500 gap-1 pt-2 sm:pt-3 md:pt-4' >
          <ActiveStrip />
        </div>
        }

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