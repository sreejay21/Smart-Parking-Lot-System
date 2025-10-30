import Card from '../components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import { getAvailability, getRevenue } from '../api/parking.api'

type AvailabilityResponse = { result: any[] }
type RevenueResponse = { result: any[] }

export default function DashboardPage() {
    const { data: availability } = useQuery<AvailabilityResponse>({
        queryKey: ['availability'],
        queryFn: getAvailability,
    })
    const { data: revenue } = useQuery<RevenueResponse>({
        queryKey: ['revenue'],
        queryFn: getRevenue,
    })


    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-3 gap-4">
                <Card title="Available">
                    <div>{availability?.result?.length ?? 0} groups</div>
                </Card>
                <Card title="Revenue">
                    <div>Total days: {revenue?.result?.length ?? 0}</div>
                </Card>
                <Card title="Quick Actions">
                    <div>Check In / Out</div>
                </Card>
            </div>
        </div>
    )
}