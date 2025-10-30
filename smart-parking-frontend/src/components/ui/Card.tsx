import React from 'react'


export default function Card({ children, title }: any) {
    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl shadow">
            {title && <h3 className="text-sm text-slate-300 mb-2">{title}</h3>}
            <div>{children}</div>
        </div>
    )
}