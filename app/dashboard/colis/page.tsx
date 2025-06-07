"use client"

import { DataTable } from '@/components/data-table-colis'
import { fetchColis } from '@/services/colisService';
import React, { useEffect, useState } from 'react'

export default function page() {

  const [colis, setColis] = useState([]);

  useEffect(() => {
    fetchColis().then(setColis).catch(console.error)
  }, [])

  return (
    <div className='m-4'>
     {colis.length >= 0 && <DataTable data={colis} />}
    </div>
  )
}
