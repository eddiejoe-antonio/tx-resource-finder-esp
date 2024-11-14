import React from 'react';
import { ArrowDownIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <div className='w-full'>
<div className='block md:flex md:items-center md:justify-between'>
  <div className='py-2 col-start-1 col-span-8 gap-0 text-left'>
    <h1 className="text-[1.5rem] md:text-[2rem] font-semibold font-['Source Sans Pro']">
      Find Digital Opportunity Resources in Texas
    </h1>
  </div>
  <div className='flex flex-col md:flex-row md:space-x-4 items-center col-start-10 col-span-2 my-4 md:my-0 md:mt-3'>
    <button
      aria-label='Add or edit resources'
      className='bg-white flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer transition ease-in-out duration-300 w-full md:w-auto mb-4 md:mb-0'
    >
      <span className='whitespace-nowrap'>Add or edit resources</span>
    </button>
    <button
      aria-label='Download resources'
      className='flex items-center justify-center px-4 py-2 bg-[#0E3052] text-white rounded-md cursor-pointer transition ease-in-out duration-300 w-full md:w-auto'
    >
      <span className='whitespace-nowrap'>Download resources</span>
      <ArrowDownIcon className='w-5 h-5 ml-2' />
    </button>
  </div>
</div>

      <div className='w-full'>
        <div className='pb-8'>
          <p className='text-lg'>
            Use this interactive tool to find support for digital opportunity needs across Texas
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
