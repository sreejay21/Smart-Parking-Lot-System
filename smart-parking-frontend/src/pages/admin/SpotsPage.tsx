import React from 'react'
import SpotForm from '../../components/forms/SpotForm'
import { useQuery } from '@tanstack/react-query'
import axiosClient from '../../api/axiosClient'

const fetchSpots = async () => {
  const res = await axiosClient.get('/admin/spots')
  return res.data
}

export default function SpotsPage() {
  const { data, refetch } = useQuery({
    queryKey: ['spots'],   
    queryFn: fetchSpots,  
  })

  return (
    <div>
      <h2 className="text-xl mb-4">Parking Spots</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <SpotForm onSuccess={refetch} />
        </div>
        <div>
          <div className="space-y-2">
            {data?.result?.map((s: any) => (
              <div key={s._id} className="p-3 bg-slate-800 rounded">
                {s.code} - {s.type} - floor {s.floor}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
