"use client"

import { DataTable } from '@/components/data-table-colis'
import { getColisAsync } from '@/redux/colisSlice';
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';

export default function page() {
 const dispatch = useDispatch();
  const { colisList, status, error } = useSelector((state) => state.colis);
  console.log("colis state:", { colisList, status, error });
  
  useEffect(() => {
    dispatch(getColisAsync());
  }, [dispatch])

  if (status === 'loading') {
    return <div className='m-4'>Chargement des colis...</div>;
  }

  if (status === 'failed') {
    return <div className='m-4 text-red-500'>Erreur: {error}</div>;
  }

  return (
    <div className='m-4'>
     {colisList && colisList.length >= 0 && <DataTable data={colisList} />}
    </div>
  )
}
