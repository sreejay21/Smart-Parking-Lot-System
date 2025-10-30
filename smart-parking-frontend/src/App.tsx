import React from 'react'
import AppRouter from './router/AppRouter'
import { Toaster } from 'sonner'


export default function App() {
    return (
        <div className="min-h-screen">
            <AppRouter />
            <Toaster position="top-right" />
        </div>
    )
}