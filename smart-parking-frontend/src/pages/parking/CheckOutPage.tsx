import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { checkOut } from '../../api/parking.api'
import { toast } from 'sonner'


export default function CheckOutPage() {
    const { register, handleSubmit } = useForm()
    const mutation = useMutation({ mutationFn: ({ number }: any) => checkOut(number), onSuccess: () => toast.success('Checked out') })


    const onSubmit = (data: any) => mutation.mutate(data)


    return (
        <div className="max-w-md">
            <h2 className="text-xl mb-4">Vehicle Check-Out</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <input {...register('number')} placeholder="Vehicle Number" className="w-full p-2 rounded bg-slate-800" />
                <button className="w-full bg-sky-500 p-2 rounded">Check Out</button>
            </form>
        </div>
    )
}