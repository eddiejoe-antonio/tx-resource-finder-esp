import { MapIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import React, { useRef, useEffect } from 'react';

interface ViewToggleProps {
  selectedView: string;
  handleNavigate: (view: string) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ selectedView, handleNavigate }) => {
  // Use refs to track the Map and List buttons
  const mapButtonRef = useRef<HTMLButtonElement>(null);
  const listButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the button that matches the selectedView after the component updates
  useEffect(() => {
    if (selectedView === 'map' && mapButtonRef.current) {
      mapButtonRef.current.focus();
    } else if (selectedView === 'list' && listButtonRef.current) {
      listButtonRef.current.focus();
    }
  }, [selectedView]);

  return (
    <div className='flex space-x-1' role='group' aria-label='View Toggle'>
      <button
        type='button'
        ref={mapButtonRef} // Attach ref to Map button
        onClick={() => handleNavigate('map')}
        aria-label='Map View'
        className={`flex px-4 py-2 rounded-full ${
          selectedView === 'map'
            ? 'bg-[#1E79C8] text-white border border-white'
            : 'bg-[#EEF7FF] text-[#092940] border border-[#3B75A9] md:hover:bg-[#3892E1] md:hover:text-white'
        }`}
      >
        <MapIcon className='w-6 h-6 mr-2' />
        Map View
      </button>

      <button
        type='button'
        ref={listButtonRef} // Attach ref to List button
        onClick={() => handleNavigate('list')}
        aria-label='Table View'
        className={`flex px-4 py-2 rounded-full ${
          selectedView === 'list'
            ? 'bg-[#1E79C8] text-white border border-white'
            : 'bg-[#EEF7FF] text-[#092940] border border-[#3B75A9] md:hover:bg-[#3892E1] md:hover:text-white'
        }`}
      >
        <TableCellsIcon className='w-6 h-6 mr-2' />
        Table View
      </button>
    </div>
  );
};

export default ViewToggle;
