import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <div className='w-full'>
      <div className='block md:flex items-center justify-between'>
        <div className='mt-16 md:mb-4 col-start-1 col-span-8 gap-0 text-left'>
          <h1 className="block md:inline  text-[1.5rem] md:text-[2rem] font-semibold font-['Source Sans Pro']">
            Find Digital Opportunity Resources in Texas
          </h1>
        </div>
        <div className='flex justify-start items-center col-start-10 col-span-2 my-4 md:my-0 md:mt-3'>
          <button
            aria-modal='true'
            role='alertdialog'
            aria-label='Contribute to the North Carolina Resource Finder'
            className={`flex items-center px-4 py-2 rounded-full cursor-pointer transition ease-in-out duration-300`}
          >
            <PlusCircleIcon className='w-6 h-6 mr-2' />
            <span className='whitespace-nowrap'>Add a Resource</span>
          </button>
        </div>
      </div>
      <div className='w-full'>
        <div className='pb-2'>
          <p className='text-lg'>
          Use this interactive tool to find support for digital opportunity needs across Texas
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
