"use client"

import { DataTable } from '@/components/data-table-menu'
import React, { useEffect, useState } from 'react'
import { fetchMenu } from '@/services/menuService';

export default function page() {

  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetchMenu().then(setMenu).catch(console.error)
  }, [])

  return (
    <div className='m-4'>
     {menu.length > 0 && <DataTable data={menu} />}
    </div>
  )
}
