// src/types/ResourceFinder.ts

export interface Resource {
  Asset: string;
  Organization_Sub_Type: string[];
  Asset_Description: string;
  Key_Contact: string;
  Contact_Email: string;
  Live_Site_Category: string[]; // Array of strings
  Website: string;
  County: string[];
  Asset_Covered_Population: string[];
}

export interface AssetListItemProps {
  resource: Resource; // Only keep the `resource` property
}

