import React from 'react'
import { LucideLogOut } from 'lucide-react'


export default function Navbar() {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
            <div className="text-lg font-semibold">Smart Parking</div>
            <div className="flex items-center gap-4">
                <button className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600">Profile</button>
                <button className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 flex items-center gap-2">
                    <LucideLogOut size={16} /> Logout
                </button>
            </div>
        </header>
    )
}