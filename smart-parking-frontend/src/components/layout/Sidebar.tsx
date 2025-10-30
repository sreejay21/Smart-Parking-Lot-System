import React from 'react'
import { NavLink } from 'react-router-dom'


const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/parking/checkin', label: 'Check In' },
    { to: '/parking/checkout', label: 'Check Out' },
    { to: '/parking/availability', label: 'Availability' },
    { to: '/parking/revenue', label: 'Revenue' },
    { to: '/admin/spots', label: 'Spots' }
]


export default function Sidebar() {
    return (
        <aside className="w-60 bg-slate-900 border-r border-slate-800 min-h-screen p-4">
            <div className="mb-6 text-xl font-bold">Admin</div>
            <nav className="flex flex-col gap-2">
                {links.map(l => (
                    <NavLink key={l.to} to={l.to} className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
                        {l.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}