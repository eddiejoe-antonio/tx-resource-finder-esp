import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    if (typeof page === 'number') {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label='pagination' className='flex justify-center items-center my-4 overflow-x-auto'>
      <ul className='pagination__list flex'>
        <li>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className='px-2 py-1 mx-1 rounded-md md:hover:bg-[#dedede]'
            aria-label='First page'
          >
            {'<<'}
          </button>
        </li>
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='px-2 py-1 mx-1 rounded-md md:hover:bg-[#dedede]'
            aria-label='Previous page'
          >
            {'<'}
          </button>
        </li>
        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {typeof page === 'number' ? (
              <button
                onClick={() => handlePageChange(page)}
                className={`px-2 py-1 mx-1 rounded-md ${
                  page === currentPage ? 'bg-[#1E79C8] text-white' : ' md:hover:bg-[#dedede]'
                }`}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span className='px-2 py-1 mx-1'>...</span>
            )}
          </li>
        ))}
        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='px-2 py-1 mx-1 rounded-md md:hover:bg-[#dedede]'
            aria-label='Next page'
          >
            {'>'}
          </button>
        </li>
        <li>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className='px-2 py-1 mx-1 rounded-md md:hover:bg-[#dedede]'
            aria-label='Last page'
          >
            {'>>'}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
