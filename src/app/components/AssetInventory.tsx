"use client";

import AssetListItem from "./AssetListItem";
import Pagination from "./Pagination";
import { useState, useRef } from "react";
import Select, { StylesConfig } from "react-select";
import useAirtableFetch from "../utils/apiService";
import { typeFilterData, geographyFilterData, popFilterData, orgFilterData } from '../static/filterResourceFinder';
import { ArrowDownIcon } from '@heroicons/react/24/outline';

const airtableBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || "";
const airtableApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || "";

interface FilterOption {
  label: string;
  value: string;
}

const customSelectStyles: StylesConfig<FilterOption, true> = {
  control: (provided) => ({
    ...provided,
    borderRadius: '0.375rem',
    borderColor: '#e2e8f0',
    boxShadow: 'none',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    '&:hover': { borderColor: '#cbd5e0' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#4a5568',
    padding: '0',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.375rem',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#edf2f7',
    borderRadius: '0.375rem',
    padding: '0 0.25rem',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#4a5568',
    fontSize: '0.875rem',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#a0aec0',
    '&:hover': { backgroundColor: '#e2e8f0', color: '#4a5568' },
  }),
};

const AssetInventory = () => {
  const { resources, loading, error } = useAirtableFetch(airtableBaseId, airtableApiKey);
  const [selectedCounty, setSelectedCounty] = useState<FilterOption[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<FilterOption[]>([]);
  const [selectedOrganizationType, setSelectedOrganizationType] = useState<FilterOption[]>([]);
  const [selectedPopulationServed, setSelectedPopulationServed] = useState<FilterOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;
  const assetSectionRef = useRef<HTMLDivElement | null>(null);

  const matchesFilter = (resourceValue: string | string[] | undefined, selectedValues: FilterOption[]): boolean => {
    if (!selectedValues.length) return true;
    if (Array.isArray(resourceValue)) {
      return selectedValues.some(selectedValue =>
        resourceValue.map(v => v.trim().toLowerCase()).includes(selectedValue.value.trim().toLowerCase())
      );
    }
    return selectedValues.some(selectedValue => 
      resourceValue?.trim().toLowerCase() === selectedValue.value.trim().toLowerCase()
    );
  };

  const filteredResources = resources.filter((resource) => {
    const matchesCounty = matchesFilter(resource.County, selectedCounty);
    const matchesServiceType = matchesFilter(resource.Live_Site_Category, selectedServiceType);
    const matchesOrganizationType = matchesFilter(resource.Organization_Sub_Type, selectedOrganizationType);
    const matchesPopulationServed = matchesFilter(resource.Asset_Covered_Population, selectedPopulationServed);

    return matchesCounty && matchesServiceType && matchesOrganizationType && matchesPopulationServed;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const scrollToTop = () => {
    assetSectionRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadCSV = () => {
    if (filteredResources.length === 0) {
      alert("No data to download");
      return;
    }

    const csvHeaders = Object.keys(filteredResources[0]).join(",");
    const csvRows = filteredResources.map(resource =>
      Object.values(resource).map(value => 
        Array.isArray(value) ? value.join(";") : value
      ).join(",")
    );

    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "filtered_resources.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading resources...</p>;
  if (error) return <p>Error loading resources: {error}</p>;

  return (
    <div ref={assetSectionRef}>
      <header className='w-full mb-6'>
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
              onClick={downloadCSV}
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
      </header>
      
      <div className="border-t border-b">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div>
            <label className="font-medium text-sm">Select County</label>
            <Select
              isMulti
              options={geographyFilterData.options}
              value={selectedCounty}
              onChange={(selected) => setSelectedCounty(selected as FilterOption[])}
              className="w-full"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="font-medium text-sm">Select Service Type</label>
            <Select
              isMulti
              options={typeFilterData.options}
              value={selectedServiceType}
              onChange={(selected) => setSelectedServiceType(selected as FilterOption[])}
              className="w-full"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="font-medium text-sm">Select Organization Type</label>
            <Select
              isMulti
              options={orgFilterData.options}
              value={selectedOrganizationType}
              onChange={(selected) => setSelectedOrganizationType(selected as FilterOption[])}
              className="w-full"
              styles={customSelectStyles}
            />
          </div>

          <div>
            <label className="font-medium text-sm">Select Population Served</label>
            <Select
              isMulti
              options={popFilterData.options}
              value={selectedPopulationServed}
              onChange={(selected) => setSelectedPopulationServed(selected as FilterOption[])}
              className="w-full"
              styles={customSelectStyles}
            />
          </div>
        </div>
      </div>
      
      <div>
        <div className="block md:flex my-6 justify-between items-center">
          <p className="my-6 md:my-0 text-lg">Showing {filteredResources.length} resources</p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedResources.map((resource, index) => (
            <AssetListItem key={index} resource={resource} />
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredResources.length / itemsPerPage)}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AssetInventory;
