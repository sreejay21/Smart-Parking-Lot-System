import React from 'react'


export default function Button(props: React.ComponentProps<'button'>) {
    return (
        <button {...props} className={`px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-400 ${props.className || ''}`}> {props.children} </button>
    )
}