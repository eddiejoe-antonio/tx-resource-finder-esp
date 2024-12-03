"use client";

import AssetListItem from "./AssetListItem";
import Pagination from "./Pagination";
import { useState, useRef } from "react";
import Select, { StylesConfig } from "react-select";
import { BeatLoader } from "react-spinners";
import useAirtableFetch from "../utils/apiService";
import { typeFilterData, geographyFilterData, popFilterData, orgFilterData } from '../static/filterResourceFinder';
import { ArrowDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

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
    if (resource.Hide === true) {
      return false;
    }
    const matchesCounty = matchesFilter(resource.County, selectedCounty);
    const matchesServiceType = matchesFilter(resource.Live_Site_Category, selectedServiceType);
    const matchesOrganizationType = matchesFilter(resource.Organization_Sub_Type, selectedOrganizationType);
    const matchesPopulationServed = matchesFilter(resource.Asset_Covered_Population, selectedPopulationServed);

    return matchesCounty && matchesServiceType && matchesOrganizationType && matchesPopulationServed;
  }).sort((a, b) => a.Asset.localeCompare(b.Asset));

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
    if (!resources || resources.length === 0) {
      alert("No data to download");
      return;
    }
  
    // Map Airtable API response into clean CSV rows
    const csvHeaders = [
      "Asset",
      "Organization",
      "Asset_Description",
      "Key_Contact",
      "Contact_Email",
      "Live_Site_Category",
      "Website",
      "County",
      "Asset_Covered_Population",
      "Hide",
    ]; // Include only the fields you want in the CSV
  
    // Generate rows from the Airtable API response
    const csvRows = resources
      .filter((resource) => !resource.Hide) // Exclude hidden resources
      .map((resource) =>
        csvHeaders
          .map((header) => {
            const value = resource[header]; // Access field by key
            if (Array.isArray(value)) {
              return value.join(";"); // Join array fields with semicolons
            }
            return value ? `"${value.toString().replace(/"/g, '""')}"` : ""; // Escape quotes
          })
          .join(",") // Separate fields with commas
      );
  
    // Combine headers and rows
    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
  
    // Trigger CSV download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "filtered_resources.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div ref={assetSectionRef}>
      <header className='w-full mb-4 md:mb-6'>
        <div className='block md:flex md:items-center md:justify-between'>
        <h1 className="text-[1.5rem] md:text-[2rem] font-semibold font-['Source Sans Pro'] md:mb-0 mb-4">
        Buscar recursos de oportunidad digital en Texas
          </h1>
          <div className='flex flex-col md:flex-row md:space-x-4 items-center'>
          <button
            aria-label="Agregar o editar recursos"
            onClick={() => {
              window.open("https://airtable.com/appbal6AbAyP6G2la/pagMbiluh9BXiW4Qf/form", "_blank");
            }}
            className="bg-white flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer transition-colors md:hover:bg-[#F9FAFB] duration-300 w-full md:w-auto mb-4 md:mb-0"
          >
            <span className="whitespace-nowrap">Agregar o editar recursos</span>
          </button>

            <button
              aria-label='Descargar recursos'
              onClick={downloadCSV}
              className='flex items-center justify-center px-4 py-2 bg-[#002768] text-white rounded-md cursor-pointer transition-colors duration-300 w-full md:w-auto md:hover:bg-[#002E99]'
            >
              <span className='whitespace-nowrap'>Descargar recursos</span>
              <ArrowDownIcon className='w-5 h-5 ml-2' />
            </button>
          </div>
        </div>
        <div className="mt-6 md:mt-2 text-lg">
        Use esta herramienta interactiva para buscar asistencia con las necesidades de oportunidad digital en todo Texas.
        </div>
      </header>

      <div className="border-t border-b">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div>
            <label className="font-medium text-sm flex items-center gap-2">
              Seleccione el condado
              {/* Tooltip */}
              <div className="tooltip-container">
                <span className="tooltip-icon">
                <QuestionMarkCircleIcon className="h-5 w-5 text-[#98A2B3] md:hover:text-[#667085]" />
                </span>
                <div className="tooltip-content">
                Utilice este filtro para seleccionar uno o más condados donde desea encontrar recursos.
                </div>
              </div>
            </label>
            <Select
              isMulti
              options={geographyFilterData.options}
              value={selectedCounty}
              onChange={(selected) => setSelectedCounty(selected as FilterOption[])}
              className="w-full mt-1 shadow-sm "
              styles={customSelectStyles}
              placeholder=""
            />
          </div>

          <div>
            <label className="font-medium text-sm flex items-center gap-2">
            Seleccione el tipo de servicio
              {/* Tooltip */}
              <div className="tooltip-container">
                <span className="tooltip-icon">
                <QuestionMarkCircleIcon className="h-5 w-5 text-[#98A2B3] md:hover:text-[#667085]" />
                </span>
                <div className="tooltip-content">
                Utilice este filtro para seleccionar una o más categorías de servicios de oportunidades digitales.
                </div>
              </div>
            </label>
            <Select
              isMulti
              options={typeFilterData.options}
              value={selectedServiceType}
              onChange={(selected) => setSelectedServiceType(selected as FilterOption[])}
              className="w-full mt-1 shadow-sm "
              styles={customSelectStyles}
              placeholder=""
            />
          </div>

          <div>
            <label className="font-medium text-sm flex items-center gap-2">
            Seleccione el tipo de organización
              {/* Tooltip */}
              <div className="tooltip-container">
                <span className="tooltip-icon">
                <QuestionMarkCircleIcon className="h-5 w-5 text-[#98A2B3] md:hover:text-[#667085]" />
                </span>
                <div className="tooltip-content">
                Utilice este filtro para seleccionar uno o más tipos de organizaciones de oportunidad digital. 
                </div>
              </div>
            </label>
            <Select
              isMulti
              options={orgFilterData.options}
              value={selectedOrganizationType}
              onChange={(selected) => setSelectedOrganizationType(selected as FilterOption[])}
              className="w-full mt-1 shadow-sm "
              styles={customSelectStyles}
              placeholder=""
            />
          </div>

          <div>
            <label className="font-medium text-sm flex items-center gap-2">
            Seleccione la población atendida
              {/* Tooltip */}
              <div className="tooltip-container">
                <span className="tooltip-icon">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-[#98A2B3] md:hover:text-[#667085]" />
                </span>
                <div className="tooltip-content">
                Utilice este filtro para seleccionar una o más poblaciones atendidas.
                </div>
              </div>
            </label>
            <Select
              isMulti
              options={popFilterData.options}
              value={selectedPopulationServed}
              onChange={(selected) => setSelectedPopulationServed(selected as FilterOption[])}
              className="w-full mt-1 shadow-sm "
              styles={customSelectStyles}
              placeholder=""
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center my-64">
        <BeatLoader color="#002768" size={20} />
      </div>
      ) : error ? (
        <p className="mt-6 text-red-600">Error loading resources: {error}</p>
      ) : (
        <>
          <p className="mt-6 text-lg">Se muestran {filteredResources.length} recursos</p>
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
        </>
      )}
    </div>
  );
};

export default AssetInventory;
