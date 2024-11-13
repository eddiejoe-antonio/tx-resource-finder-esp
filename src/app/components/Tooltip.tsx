import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  message: string;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ message, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className='relative inline-block'
    >
      {children}
      {isHovered && (
        <div className='invisible md:visible tooltip-content bg-black text-white text-sm p-2 rounded absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 text-center'>
          {message}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
