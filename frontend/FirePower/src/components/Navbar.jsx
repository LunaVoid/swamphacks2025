
import React from 'react'

function Navbar() {
return (
        <nav className='flex bg-gray-800 text-white flex-col h-1/3'>
            <ul className='flex flex-row space-x-8'>
                <li><a href = "/dash">Dashboard</a></li>
                <li><a href = "/camera">Camera</a></li>
            </ul>
        </nav>
    )
}

export default Navbar