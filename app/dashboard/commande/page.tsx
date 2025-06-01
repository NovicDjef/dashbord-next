"use client"

import { DataTable } from '@/components/data-table-commande'
import { fetchCommande } from '@/services/commandeService';
import React, { useEffect, useState } from 'react'

export default function page() {

  const [commande, setCommande] = useState([]);

  useEffect(() => {
    fetchCommande().then(setCommande).catch(console.error)
  }, [])

  return (
    <div className='m-4'>
     {commande.length > 0 && <DataTable data={commande} />}
    </div>
  )
}
