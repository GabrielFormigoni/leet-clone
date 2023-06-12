import React from 'react';
import Link from 'next/link';
import { useSetRecoilState } from 'recoil'

import { authModalState } from '@/atoms/authModalAtom';
import Image from 'next/image';

type NavbarProps = {
    
};

const Navbar:React.FC<NavbarProps> = () => {
    const setAuth = useSetRecoilState(authModalState)

    const handleClick = () => {
        setAuth((prev) => ({...prev, isOpen: true}))
    }

    return <div className='flex items-center justify-between px-2 sm:px-12 md:px-24'>
        <Link href='/' className='flex justify-center items-center h-20'>
            <Image src="/logo.png" alt="logo" height={200} width={200} />
        </Link>
        <div className='flex items-center'>
            <button onClick={handleClick} className='bg-brand-orange px-2 py-1 sm:px-4 rounded-md text-white font-medium hover:bg-white hover:text-brand-orange 
            hover:border-brand-orange hover:border-2 border-2 border-transparent transition duration-300 ease-in-out'>Sign In</button>
        </div>
    </div>
}
export default Navbar;