import React, { useState } from 'react'
import ProblemsTable from '@/components/ProblemsTable/ProblemsTable'
import Topbar from '@/components/Topbar/Topbar'
import useHasMounted from '@/hooks/useHasMounted'

const Home = () => {
  const [loading, setLoading] = useState(true)
  const hasMounted = useHasMounted()

  if(!hasMounted) return null;
  
  return (
    <div className='bg-dark-layer-2 min-h-screen'>
      <Topbar />
      <h3 className='text-center uppercase text-dark-gray-7 text-2xl mt-10 font-medium mb-5'> &ldquo; List of exercises &rdquo; 👇</h3>
      <div className='relative overflow-x-auto mx-auto px-6 pb-10'>
        {loading && (
          <div className='max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse'>
            {[...Array(10)].map((_, i) => (
            <LoadingSkeleton key={i} />
            ))}
          </div>
        )}
          <table className='text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full max-w-[1200px] mx-auto'>
          {!loading && (
            <thead className='text-xs text-gray-700 uppercase dark:text-gray-400 border-b'>
              <tr>
                <th scope='col' className='px-1 py-3 w-0 font-medium'>Status</th>
                <th scope='col' className='px-1 py-3 w-0 font-medium'>Title</th>
                <th scope='col' className='px-1 py-3 w-0 font-medium'>Difficulty</th>
                <th scope='col' className='px-1 py-3 w-0 font-medium'>Category</th>
                <th scope='col' className='px-1 py-3 w-0 font-medium'>Solution</th>
              </tr>
            </thead>
            )}
            <ProblemsTable setLoadingProblems={setLoading} />
          </table>
      </div>
    </div>
  )
}

const LoadingSkeleton = () => {
	return (
		<div className='flex items-center space-x-12 mt-4 px-6'>
			<div className='w-6 h-6 shrink-0 rounded-full bg-dark-layer-1'></div>
			<div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
			<div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
			<div className='h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1'></div>
			<span className='sr-only'>Loading...</span>
		</div>
	);
};

export default Home