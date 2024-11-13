import React, { useState } from 'react';
import { MapPinIcon, BookmarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import { AssetListItemProps } from '../types/assetInventoryTypes';

const AssetListItem: React.FC<AssetListItemProps> = ({ resource }) => {
  const [showMore, setShowMore] = useState(false);

  const formatType = (type: string | string[]) => {
    if (Array.isArray(type)) {
      return type.join(', ');
    } else {
      return type;
    }
  };

  const formatWebsite = (url: string | undefined | null) => {
    if (!url) {
      return '';
    }
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className='flex flex-col border-b border-[#3B75A9] transition-all ease-in-out duration-300'>
      <div className='text-black py-2'>
        {/* Make the title clickable and trigger zoomToAsset */}
        <h2
          className='mt-1 font-bold text-lg cursor-pointer hover:text-[#1E79C8] transition-colors ease-in-out'
        >
          {resource.Asset}
        </h2>
      </div>
      <div className=''>
        <div className='flex items-center text-sm py-2 text-[#0E3052]'>
          <MapPinIcon className='h-6 w-6 mr-2 flex-shrink-0 [stroke-width:2]' />
            {resource.County}
        </div>
      </div>
      <div className=''>
        <div className='flex items-center text-sm py-2 text-[#0E3052]'>
          <BookmarkIcon className='h-6 w-6 mr-2 flex-shrink-0 [stroke-width:2]' />
          <div className='flex-grow min-w-0 whitespace-normal break-words'>
            {formatType(resource.Live_Site_Category)}
          </div>
        </div>
      </div>
      <div className=''>
        <div className='flex items-center text-sm py-2 text-[#0E3052]'>
          <LinkIcon className='h-6 w-6 mr-2 flex-shrink-0 [stroke-width:2]' />
          {resource.Website && (
            <a
              href={formatWebsite(resource.Website)}
              target='_blank'
              rel='noopener noreferrer'
              className='md:hover:text-[#1E79C8] transition-colors ease-in-out duration-300 flex-grow min-w-0 whitespace-normal break-words'
            >
              {resource.Website}
            </a>
          )}
        </div>
      </div>
      <div className='pt-4 pb-6'>
        <button
          aria-label={`Learn more about ${resource.Asset}`}
          onClick={() => setShowMore(!showMore)}
          className='border border-[#1E79C8] text-[#1E79C8] hover:bg-[#3892E1] hover:text-white text-sm cursor-pointer px-12 py-2 rounded-full transition-colors duration-300 flex items-center justify-center gap-2 font-semibold'
        >
          {showMore ? <>Collapse</> : <>Learn More</>}
        </button>
        {showMore && (
          <div className='my-4 text-md'>
            <div className='my-4'>
              <p className='my-2 font-semibold'>Description</p>
              <p className='whitespace-normal break-words'>{resource.Asset_Description}</p>
            </div>
            <div className='my-4'>
              <p className='my-2 font-semibold'>Contact Information</p>
              <p className='whitespace-normal break-words'>{resource.Key_Contact}</p>

              {resource.Contact_Email && (
                <p className='whitespace-normal break-words'>
                  <a
                    href={`mailto:${resource.Contact_Email}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='md:hover:text-[#1E79C8] transition-colors ease-in-out duration-300 flex-grow min-w-0 whitespace-normal break-words'
                  >
                    {resource.Contact_Email}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetListItem;
