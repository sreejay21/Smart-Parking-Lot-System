import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkIn } from '../../api/parking.api'
import { toast } from 'sonner'

export default function CheckInPage() {
  const { register, handleSubmit } = useForm()
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      toast.success('Checked in')
      qc.invalidateQueries({ queryKey: ['availability'] })
    },
  })

  const onSubmit = (data: any) => mutation.mutate(data)

  return (
    <div className="max-w-md">
      <h2 className="text-xl mb-4">Vehicle Check-In</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input
          {...register('number')}
          placeholder="Vehicle Number"
          className="w-full p-2 rounded bg-slate-800"
        />
        <select {...register('type')} className="w-full p-2 rounded bg-slate-800">
          <option value="car">Car</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="bus">Bus</option>
        </select>
        <input
          {...register('owner')}
          placeholder="Owner (optional)"
          className="w-full p-2 rounded bg-slate-800"
        />
        <button className="w-full bg-sky-500 p-2 rounded">Check In</button>
      </form>
    </div>
  )
}
