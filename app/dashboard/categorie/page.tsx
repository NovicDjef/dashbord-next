"use client"

import { DataTable } from '@/components/data-table-categorie'
import React, { useEffect, useState } from 'react'
import { fetchCategorie } from '@/services/categorieService';

export default function page() {

  const [categorie, setCategorie] = useState([]);

  useEffect(() => {
    fetchCategorie().then(setCategorie).catch(console.error)
  }, [])

  return (
    <div className='m-4'>
     {categorie.length > 0 && <DataTable data={categorie} />}
    </div>
  )
}
