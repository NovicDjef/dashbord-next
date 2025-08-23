"use client"

import { DataTable } from '@/components/data-table'
import React, { useEffect, useState } from 'react'
import data from "../data.json"
import { fetchUsers } from '@/services/userService';
import { useSelector } from 'react-redux';

export default function page() {

  const users = useSelector((state) => state.users.usersList);

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className='m-4'>
     {users.length > 0 && <DataTable data={users} />}
    </div>
  )
}
