"use client"

import { DataTable } from '@/components/data-table-repas'
import React, { useEffect, useState } from 'react'
import { fetchRepas } from '@/services/repasService';

export default function page() {

  const [repas, setRepas] = useState([]);

  useEffect(() => {
    fetchRepas().then(setRepas).catch(console.error)
  }, [])

  return (
    <div className='m-4'>
     {repas.length > 0 && <DataTable data={repas} />}
    </div>
  )
}
