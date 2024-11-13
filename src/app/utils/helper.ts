import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

interface Resource {
  Geography: string;
  Zipcode: string;
  Name: string;
  DeviceAccess: number; // Assuming Device Access is a number
  DigitalSkillsAndSupport: number; // Assuming Digital Skills & Technical Support is a number
  DigitalNavigation: number;
  PublicDevicesAndInternet: number;
  DigitalInclusionFunding: number;
  BroadbandAccessAndAffordability: number;
  Other: number;
  TotalServices: number;
  Type: string[]; // Assuming Type is an array of strings
  Primary_Type: string;
  ServicesProvided: string;
}

// Define a new type that intersects possible GeoJsonProperties (or null) with your custom properties
type CustomGeoJsonProperties = GeoJsonProperties & {
  County?: string;
  resources?: Resource[];
};

const prepareGeoJsonData = (
  geoJson: FeatureCollection<Geometry, GeoJsonProperties>,
  resources: Resource[],
): FeatureCollection<Geometry, CustomGeoJsonProperties> => {
  const resourceMap = resources.reduce((acc: { [key: string]: Resource[] }, resource: Resource) => {
    const countyKey = resource.Geography.toLowerCase();
    acc[countyKey] = acc[countyKey] || [];
    acc[countyKey].push(resource);
    return acc;
  }, {});

  return {
    ...geoJson,
    features: geoJson.features.map((feature) => {
      const county =
        feature.properties && 'County' in feature.properties
          ? feature.properties['County']?.toLowerCase()
          : '';
      return {
        ...feature,
        properties: {
          ...feature.properties,
          resources: resourceMap[county],
        },
      };
    }),
  };
};

export default prepareGeoJsonData;
