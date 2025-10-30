import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import CheckInPage from '../pages/parking/CheckInPage'
import CheckOutPage from '../pages/parking/CheckOutPage'
import AvailabilityPage from '../pages/parking/AvailabilityPage'
import RevenuePage from '../pages/parking/RevenuePage'
import SpotsPage from '../pages/admin/SpotsPage'
import AddSpotPage from '../pages/admin/AddSpotPage'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'


export default function AppRouter() {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen">
                <Navbar />
                <main className="p-6">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/parking/checkin" element={<CheckInPage />} />
                        <Route path="/parking/checkout" element={<CheckOutPage />} />
                        <Route path="/parking/availability" element={<AvailabilityPage />} />
                        <Route path="/parking/revenue" element={<RevenuePage />} />
                        <Route path="/admin/spots" element={<SpotsPage />} />
                        <Route path="/admin/spots/add" element={<AddSpotPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}