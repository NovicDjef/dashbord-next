"use client"

import { DataTable } from '@/components/data-table-restaurant'
import React, { useEffect, useState } from 'react'
import { fetchRestaurant } from '@/services/restaurantService';

export default function page() {

  const [restaurant, setRestaurant] = useState([]);

  useEffect(() => {
    fetchRestaurant().then(setRestaurant).catch(console.error)
  }, [])

  return (
    <div className='m-4'>
     {restaurant.length > 0 && <DataTable data={restaurant} />}
    </div>
  )
}
