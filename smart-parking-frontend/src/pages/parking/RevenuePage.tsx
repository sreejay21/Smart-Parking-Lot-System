import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRevenue } from '../../api/parking.api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function RevenuePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['revenue'],
    queryFn: getRevenue,
  })

  const items = data?.result ?? []

  return (
    <div>
      <h2 className="text-xl mb-4">Revenue</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="h-64 bg-slate-800 p-4 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={items}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#60a5fa"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
