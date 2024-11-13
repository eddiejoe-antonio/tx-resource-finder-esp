"use client"; // Add this to make the component a Client Component

import AssetListItem from "./AssetListItem";
import Pagination from "./Pagination";
import { useState, useRef } from "react";
import useAirtableFetch from "../utils/apiService";

const airtableBaseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || "";
const airtableApiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || "";

const AssetInventory = () => {
  const { resources, loading, error } = useAirtableFetch(airtableBaseId, airtableApiKey);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18; // Number of resources to show per page
  const assetSectionRef = useRef<HTMLDivElement | null>(null);

  // Get the current page resources
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = resources.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const scrollToTop = () => {
    if (assetSectionRef.current) {
      assetSectionRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return <p>Loading resources...</p>;    
  }

  if (error) {
    return <p>Error loading resources: {error}</p>;
  }

  return (
    <div ref={assetSectionRef}>
                <div className="border-t"></div>
                    <div className="h-[20vh] border-b"></div>
                <div>
      <div className="block md:flex my-6 justify-between items-center">
          <p className="my-6 md:my-0 text-lg">
            Showing {resources.length} resources
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 space-y-0">
        {paginatedResources.map((resource, index) => (
          <AssetListItem key={index} resource={resource} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(resources.length / itemsPerPage)}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AssetInventory;
