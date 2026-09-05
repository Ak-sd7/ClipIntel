"use client"
import { Galaxy, CircleUser } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Nav = () => {
	const router = useRouter();
	return (
		<div className="flex flex-row p-3 justify-between bg-gray-300 w-full">
			<div className='flex flex-row items-center cursor-pointer' onClick={() => { router.push('/') }}>
				<Galaxy color='#000000' strokeWidth={2} size={40} />
				<h1 className='pl-1.5 font-chokokutai font-semibold text-2xl'>ClipIntel</h1>
			</div>
			<div className='cursor-pointer'>
				<CircleUser size={35} />
			</div>
		</div>
	)
}

export default Nav