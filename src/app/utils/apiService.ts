import { useState, useEffect } from "react";
import { Resource } from "../types/assetInventoryTypes";

interface ResourceFields {
  "Asset": string;
  "Location": string;
  "Asset Description"?: string;
  "Key Contact"?: string;
  "Contact Email"?: string;
  "Live Site Category"?: string[];
  "Website"?: string;
  "County"?: string;
  "Organization Sub-Type": string[];
  "Asset Covered Population": string[];
  "Hide": boolean;
}


interface AirtableRecord {
  id: string;
  fields: ResourceFields;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

const useAirtableFetch = (airtableBaseId: string, airtableApiKey: string) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/Full%20Assets%202024%20Cleaned`;
      let allRecords: Resource[] = [];
      let offset: string | undefined = undefined;

      try {
        do {
          const url = offset ? `${airtableUrl}?offset=${offset}` : airtableUrl;
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${airtableApiKey}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data: AirtableResponse = await response.json();

          const formattedData: Resource[] = data.records.map((record) => ({
            Asset: record.fields["Asset"] || "",
            Organization_Sub_Type: record.fields["Organization Sub-Type"] || [],
            Asset_Description: record.fields["Asset Description"] || "",
            Key_Contact: record.fields["Key Contact"] || "",
            Contact_Email: record.fields["Contact Email"] || "",
            Live_Site_Category: record.fields["Live Site Category"] || [],
            Website: record.fields["Website"] || "",
            County: Array.isArray(record.fields["County"]) ? record.fields["County"] : [record.fields["County"] || ""],
            Asset_Covered_Population: record.fields["Asset Covered Population"] || [],
            Hide: record.fields.Hide,
          }));
          
        
          allRecords = [...allRecords, ...formattedData];
          offset = data.offset; // Update offset for the next iteration, if present
        } while (offset);

        setResources(allRecords);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Error fetching Airtable data:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [airtableBaseId, airtableApiKey]);  
  return { resources, loading, error };
};

export default useAirtableFetch;
