import { useState, useEffect } from "react";
import { Resource } from "../types/assetInventoryTypes";

interface ResourceFields {
  "Asset_ESP": string;
  "Location": string;
  "Asset Description_ESP"?: string;
  "Key Contact"?: string;
  "Contact Email"?: string;
  "Live Site Category_ESP"?: string[];
  "Website"?: string;
  "County"?: string;
  "Organization_Type_ESP_New": string[];
  "Asset Covered Population_ESP": string[];
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
            Asset: record.fields["Asset_ESP"] || "",
            Organization_Sub_Type: record.fields["Organization_Type_ESP_New"] || [],
            Asset_Description: record.fields["Asset Description_ESP"] || "",
            Key_Contact: record.fields["Key Contact"] || "",
            Contact_Email: record.fields["Contact Email"] || "",
            Live_Site_Category: record.fields["Live Site Category_ESP"] || [],
            Website: record.fields["Website"] || "",
            County: Array.isArray(record.fields["County"]) ? record.fields["County"] : [record.fields["County"] || ""],
            Asset_Covered_Population: record.fields["Asset Covered Population_ESP"] || [],
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
