"use client"

import { DataTable } from '@/components/data-table'
import React, { useEffect, useState } from 'react'
import data from "../data.json"
import { fetchUsers } from '@/services/userService';

export default function page() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error)
  }, [])

  return (
    <div className='m-4'>
     {users.length > 0 && <DataTable data={users} />}
    </div>
  )
}
