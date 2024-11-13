import { useState, useEffect } from "react";
import { Resource } from "../types/assetInventoryTypes"; // Import the Resource interface

// Define the structure of your resource fields here
interface ResourceFields {
  Asset: string;
  Location: string;
  Asset_Description?: string;
  Key_Contact?: string;
  Contact_Email?: string;
  Live_Site_Category?: string[];
  Website?: string;
  County?: string;
  // Add other fields as necessary
}

// Define the structure of an Airtable record
interface AirtableRecord {
  id: string;
  fields: ResourceFields;
}

const useAirtableFetch = (airtableBaseId: string, airtableApiKey: string) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/Full%20Assets%202024%20Cleaned`;
    let allRecords: Resource[] = [];

    const fetchAirtableData = async (offset?: string) => {
      try {
        // Construct the URL with offset if available
        let url = airtableUrl;
        if (offset) {
          url += `?offset=${offset}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${airtableApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Map the current page's records into the desired Resource structure
        const formattedData: Resource[] = data.records.map((record: AirtableRecord) => ({
          Asset: record.fields.Asset || "",
          Asset_Description: record.fields.Asset_Description || "",
          Key_Contact: record.fields.Key_Contact || "",
          Contact_Email: record.fields.Contact_Email || "",
          Live_Site_Category: record.fields.Live_Site_Category || [],
          Website: record.fields.Website || "",
          County: record.fields.County || "",
        }));

        // Concatenate the current page's records with all previous records
        allRecords = allRecords.concat(formattedData);

        // If there's an offset, continue fetching
        if (data.offset) {
          fetchAirtableData(data.offset);
        } else {
          // If no more offset, set the full records to state
          setResources(allRecords);
          setLoading(false);
        }
      } catch (err: unknown) {
        let errorMessage = "An unknown error occurred";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        console.error("Error fetching Airtable data:", errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    // Start fetching data
    fetchAirtableData();
  }, [airtableBaseId, airtableApiKey]);

  return { resources, loading, error };
};

export default useAirtableFetch;
