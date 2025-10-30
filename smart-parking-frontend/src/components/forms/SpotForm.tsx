import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import axiosClient from '../../api/axiosClient'


const schema = z.object({
    code: z.string().min(1),
    floor: z.number().min(0),
    zone: z.string().optional(),
    type: z.enum(['car', 'bus', 'motorcycle']),
    spotNumber: z.number().min(0)
})


export default function SpotForm({ onSuccess }: any) {
    const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) })


    const onSubmit = async (data: any) => {
        try {
            await axiosClient.post('/admin/spot', data)
            toast.success('Spot created')
            onSuccess?.()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed')
        }
    }


    return (
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <input {...register('code')} placeholder="Code" className="w-full p-2 rounded bg-slate-800" />
            <input type="number" {...register('floor', { valueAsNumber: true })} placeholder="Floor" className="w-full p-2 rounded bg-slate-800" />
            <input {...register('zone')} placeholder="Zone" className="w-full p-2 rounded bg-slate-800" />
            <select {...register('type')} className="w-full p-2 rounded bg-slate-800">
                <option value="car">Car</option>
                <option value="bus">Bus</option>
                <option value="motorcycle">Motorcycle</option>
            </select>
            <input type="number" {...register('spotNumber', { valueAsNumber: true })} placeholder="Spot Number" className="w-full p-2 rounded bg-slate-800" />
            <button className="w-full bg-sky-500 p-2 rounded">Create Spot</button>
        </form>
    )
}