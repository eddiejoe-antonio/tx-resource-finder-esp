import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, MapIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AssetListItem from './AssetListItem';
import ViewToggle from './ViewToggle';
import { geographyFilterData, typeFilterData, FilterOption } from '../static/filterResourceFinder';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Pagination from './Pagination';
import { fetchGeoResources } from '../utils/apiService';
import type GeoJSON from 'geojson';
import Fuse from 'fuse.js';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWRkaWVqb2VhbnRvbmlvIiwiYSI6ImNsNmVlejU5aDJocHMzZW8xNzhhZnM3MGcifQ.chkV7QUpL9e3-hRc977uyA';

type GeoJsonFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  GeoJSON.GeoJsonProperties
>;

interface County {
  value: string;
  label: string;
  type?: string;
}


const ResourceFinder =() => {
  const [geoResource, setGeoResource] = useState<GeoJsonFeatureCollection>({
    type: 'FeatureCollection',
    features: [],
  });
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [countyQuery, setCountyQuery] = useState<string>('');
  const [showCountyOptions, setShowCountyOptions] = useState<boolean>(false);
  const [highlightedCountyIndex, setHighlightedCountyIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isMapFocused, setIsMapFocused] = useState<boolean>(false);
  const [countyList, setCountyList] = useState<County[]>([]);
  const [currentCountyIndex, setCurrentCountyIndex] = useState<number>(-1);
  const [selectedAsset, setSelectedAsset] = useState<GeoJSON.Feature | null>(null);
  const ITEMS_PER_PAGE = 18;
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countyInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const assetSectionRef = useRef<HTMLDivElement>(null);
  const srCountyRef = useRef<HTMLDivElement>(null);
  const [selectedView, setSelectedView] = useState('map');
  const handleViewToggle = (view: string) => {
    setSelectedView(view);

    // Reset filters when toggling views
    setSelectedType([]); // Clear type filter
    setSelectedCounty(null); // Clear selected county
    setCountyQuery(''); // Clear the geography dropdown query
    setSearchQuery(''); // Clear search query
    setCurrentPage(1); // Reset pagination
    setSelectedAsset(null); // Deselect any selected asset

    // If toggling to map view, zoom out to North Carolina bounds
    if (view === 'map' && mapInstance.current) {
      mapInstance.current.fitBounds(northCarolinaBounds, { padding: 20 });
    }
  };

  const filteredCounties = geographyFilterData.options.filter((option) =>
    option.label.toLowerCase().includes(countyQuery.toLowerCase()),
  );

  const northCarolinaBounds = new mapboxgl.LngLatBounds(
    [-84.3219, 33.7529], // Southwest corner of NC
    [-75.4001, 36.588], // Northeast corner of NC
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const geoData = await fetchGeoResources();
        setGeoResource(geoData);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isModalOpen) {
        setSelectedType([]);
        setCurrentPage(1);
        setSelectedAsset(null);
        setSelectedCounty(null);
        mapInstance.current?.fitBounds(northCarolinaBounds, { padding: 20 });
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);

  // Initialize Map and handle view switch zoom logic
  useEffect(() => {
    if (selectedView === 'map' && !mapInstance.current && mapContainer.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/eddiejoeantonio/clxdqaemw007001qj6xirfmxv',
        maxZoom: 20,
        maxBounds: northCarolinaBounds,
        attributionControl: false,
      });
      mapInstance.current.fitBounds(northCarolinaBounds, { padding: 20 });

      const navControl = new mapboxgl.NavigationControl();
      mapInstance.current.addControl(navControl, 'top-right');

      mapInstance.current.on('load', () => {
        // Always start by zooming to North Carolina bounds on map initialization
        mapInstance.current!.fitBounds(northCarolinaBounds, { padding: 20 });
        // Sources and layers setup
        if (mapInstance.current) {
          mapInstance.current.addSource('counties', {
            type: 'vector',
            url: 'mapbox://eddiejoeantonio.5kdb3ae2',
          });

          mapInstance.current.addSource('zipcodes', {
            type: 'vector',
            url: 'mapbox://eddiejoeantonio.23a15qmt',
          });

          mapInstance.current.addLayer({
            id: 'counties-layer',
            type: 'fill',
            source: 'counties',
            'source-layer': 'ncgeo',
            paint: {
              'fill-color': 'transparent',
              'fill-opacity': 0.0,
              'fill-outline-color': 'white',
            },
          });

          mapInstance.current.addLayer({
            id: 'zipcodes-layer',
            type: 'fill',
            source: 'zipcodes',
            'source-layer': 'NC_Zipcodes',
            paint: {
              'fill-color': 'transparent',
              'fill-opacity': 0.0,
              'fill-outline-color': 'white',
            },
          });

          // GeoJSON data for assets
          if (geoResource) {
            mapInstance.current.addSource('geojson-data', {
              type: 'geojson',
              data: geoResource,
            });

            mapInstance.current.addLayer({
              id: 'geojson-layer',
              type: 'circle',
              source: 'geojson-data',
              paint: {
                'circle-radius': {
                  stops: [
                    [8, 3],
                    [11, 9],
                    [16, 12],
                  ],
                },
                'circle-color': '#BC2442',
                'circle-opacity': 0.85,
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-stroke-opacity': 1,
              },
            });

            // Tooltip for assets
            const tooltip = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
            });

            mapInstance.current.on('mousemove', 'geojson-layer', (e) => {
              const coordinates = e.lngLat;
              const feature = e.features?.[0];

              if (feature && feature.properties) {
                tooltip
                  .setLngLat(coordinates)
                  .setHTML(
                    `<p><strong>${feature.properties.name}</strong></p><p>${feature.properties.address_geocode}</p>`,
                  )
                  .addTo(mapInstance.current!);
              }
            });

            mapInstance.current.on('mouseleave', 'geojson-layer', () => {
              tooltip.remove();
            });

            // Zoom to asset on click
            mapInstance.current.on('click', 'geojson-layer', (e) => {
              const clickedFeature = e.features?.[0];
              if (clickedFeature) {
                const geometry = clickedFeature.geometry;
                if (geometry.type === 'Point') {
                  const coordinates = geometry.coordinates as [number, number];
                  mapInstance.current!.flyTo({
                    center: coordinates,
                    zoom: 14,
                  });
                  setSelectedAsset(clickedFeature);
                }
              }
            });
          }
          const counties = geographyFilterData.options.map((option) => ({
            value: option.value,
            label: option.label,
          }));
          setCountyList(counties);

          mapInstance.current.getContainer().setAttribute('tabindex', '0');
        }
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [selectedView, isMobile, geoResource]);

  // Handle county selection logic
  useEffect(() => {
    if (mapInstance.current && mapInstance.current.isStyleLoaded()) {
      if (selectedCounty) {
        const bounds = new mapboxgl.LngLatBounds();
        const features = mapInstance.current.querySourceFeatures('counties', {
          sourceLayer: 'ncgeo',
          filter: ['==', 'County', selectedCounty.value],
        });

        if (features.length > 0) {
          features.forEach((feature) => {
            if (feature.geometry.type === 'Polygon') {
              (feature.geometry.coordinates[0] as mapboxgl.LngLatLike[]).forEach((coord) => {
                bounds.extend(coord);
              });
            }
          });

          if (!bounds.isEmpty()) {
            mapInstance.current.fitBounds(bounds, { padding: 20 });
          }
        }
      } else {
        mapInstance.current.fitBounds(northCarolinaBounds, { padding: 20 });
      }
    }
  }, [selectedCounty]);

  const handleCountySelection = (geography: County) => {
    setSelectedAsset(null);
    setSelectedCounty(geography);
    setCountyQuery(geography.label);
    setShowCountyOptions(false);
    setCurrentPage(1); // Reset to page 1 when geography changes

    if (mapInstance.current) {
      const bounds = new mapboxgl.LngLatBounds();

      if (geography.type === 'County') {
        const features = mapInstance.current.querySourceFeatures('counties', {
          sourceLayer: 'ncgeo',
          filter: ['==', 'County', geography.value],
        });

        if (features.length > 0) {
          features.forEach((feature) => {
            if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
              (feature.geometry.coordinates[0] as mapboxgl.LngLatLike[]).forEach((coord) => {
                bounds.extend(coord);
              });
            }
          });

          if (!bounds.isEmpty()) {
            mapInstance.current.fitBounds(bounds, { padding: 20 });
          }
        }
      } else if (geography.type === 'ZipCode') {
        const features = mapInstance.current.querySourceFeatures('zipcodes', {
          sourceLayer: 'NC_Zipcodes',
          filter: ['==', 'ZCTA5CE20', geography.value],
        });

        if (features.length > 0) {
          features.forEach((feature) => {
            if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
              (feature.geometry.coordinates[0] as mapboxgl.LngLatLike[]).forEach((coord) => {
                bounds.extend(coord);
              });
            }
          });

          if (!bounds.isEmpty()) {
            mapInstance.current.fitBounds(bounds, { padding: 20 });
          }
        }
      }
    }
  };

  // Handle primary type (category) selection
  const toggleTypeSelection = (type: string) => {
    setSelectedAsset(null);
    setSelectedType((prevSelectedTypes) =>
      prevSelectedTypes.includes(type)
        ? prevSelectedTypes.filter((t) => t !== type)
        : [...prevSelectedTypes, type],
    );
    setCurrentPage(1); // Reset to page 1 when primary type changes
    scrollToTop();
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedAsset(null);
    setCurrentPage(1); // Reset to page 1 on search change
    scrollToTop();
  };
  const handleCountyQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;

    // Check if the new value is shorter than the previous one, indicating a deletion
    if (newQuery.length < countyQuery.length) {
      clearCountyQuery(); // Clear the entire input and deselect geography
    } else {
      setCountyQuery(newQuery);
      setShowCountyOptions(true);
      setHighlightedCountyIndex(-1);
    }
    setCurrentPage(1); // Reset pagination when query changes
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedCountyIndex((prevIndex) =>
        prevIndex < filteredCounties.length - 1 ? prevIndex + 1 : prevIndex,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedCountyIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    } else if (e.key === 'Enter') {
      if (highlightedCountyIndex >= 0 && highlightedCountyIndex < filteredCounties.length) {
        handleCountySelection(filteredCounties[highlightedCountyIndex]);
      }
    } else if (e.key === 'Tab') {
      setShowCountyOptions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountyOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleMapKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isMapFocused) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentCountyIndex((prevIndex) =>
          prevIndex < countyList.length - 1 ? prevIndex + 1 : 0,
        );
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentCountyIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : countyList.length - 1,
        );
      } else if (e.key === 'Enter' && currentCountyIndex >= 0) {
        const countyName = countyList[currentCountyIndex].value;
        handleCountySelection({ value: countyName, label: countyName });

        if (mapInstance.current) {
          const features = mapInstance.current.querySourceFeatures('counties', {
            sourceLayer: 'ncgeo',
            filter: ['==', 'County', countyName],
          });

          if (features.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            features.forEach((feature) => {
              if (feature.geometry.type === 'Polygon') {
                (feature.geometry.coordinates[0] as mapboxgl.LngLatLike[]).forEach((coord) => {
                  bounds.extend(coord);
                });
              }
            });

            if (!bounds.isEmpty()) {
              mapInstance.current.fitBounds(bounds, { padding: 20 });
            }
          }
        }
      } else if (e.key === 'Escape') {
        setIsMapFocused(false);
        setCurrentCountyIndex(-1);
        if (mapInstance.current) {
          mapInstance.current.fitBounds(northCarolinaBounds, { padding: 20 });
        }
      }

      if (currentCountyIndex >= 0 && srCountyRef.current) {
        srCountyRef.current.innerText = `Focused on ${countyList[currentCountyIndex].label} County`;
      }
    }
  };

  const scrollToTop = () => {
    if (assetSectionRef.current) {
      assetSectionRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChange = (page: number) => {
    if (!selectedAsset) {
      setCurrentPage(page);
      scrollToTop();
    }
  };

  const currentGeography = selectedCounty
    ? selectedCounty.type === 'County'
      ? `${selectedCounty.label} County`
      : selectedCounty.label
    : 'North Carolina';

  const getSummaryText = () => {
    if (selectedAsset) {
      return (
        <>
          Showing {selectedAsset.properties?.name}
          <button
            className='ml-2 inline-flex align-middle items-center'
            onClick={() => {
              setSelectedAsset(null); // Deselect asset
              clearCountyQuery(); // Clear the county input when an asset is deselected
              mapInstance.current!.fitBounds(northCarolinaBounds, { padding: 20 }); // Reset map view
            }}
            aria-label='Deselect asset'
          >
            <XMarkIcon className='h-6 w-6 text-gray-600 hover:text-gray-800' />
          </button>
        </>
      );
    } else {
      return (
        <>
          Showing {filteredAndMappedResources.length} results for{' '}
          <strong>{currentGeography}</strong>
          {selectedType.length > 0 && (
            <>
              {' '}
              that help you <strong>{selectedType.join(', ')}</strong>
            </>
          )}
        </>
      );
    }
  };

  const fuseOptions = {
    keys: [
      'properties.name',
      'properties.description',
      'properties.primary_type',
      'properties.geography',
      'properties.address_geocode',
    ],
    threshold: 0.3,
  };

  const fuse = new Fuse(geoResource.features, fuseOptions);

  const searchFilteredResources = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : geoResource.features;

  const filteredAndMappedResources = searchFilteredResources
    .filter((resource) => resource.geometry.type === 'Point')
    .map((resource) => {
      const properties = {
        name: resource.properties?.name || '',
        geography: resource.properties?.geography,
        zip_code: resource.properties?.zip_code ? String(resource.properties.zip_code) : undefined,
        primary_type: resource.properties?.primary_type,
        website: resource.properties?.website,
        description: resource.properties?.description,
        address_geocode: resource.properties?.address_geocode,
        googlemaps_link: resource.properties?.googlemaps_link,
        contact_name: resource.properties?.contact_name,
        contact_email: resource.properties?.contact_email,
        contact_phone: resource.properties?.contact_phone,
      };

      return {
        type: 'Feature',
        geometry: resource.geometry as GeoJSON.Point,
        properties: properties,
      } as GeoJSON.Feature<GeoJSON.Point, typeof properties>;
    })
    .filter((resource) => {
      const countyMatch =
        !selectedCounty ||
        (selectedCounty.type === 'County' &&
          resource.properties.geography?.includes(selectedCounty.value)) ||
        (selectedCounty.type === 'ZipCode' &&
          resource.properties.zip_code &&
          resource.properties.zip_code.includes(selectedCounty.value));

      const typeMatch =
        selectedType.length === 0 ||
        selectedType.some((type) => resource.properties.primary_type?.includes(type));

      return countyMatch && typeMatch;
    });

  useEffect(() => {
    if (mapInstance.current && mapInstance.current.isStyleLoaded()) {
      const filteredGeoJson: GeoJSON.FeatureCollection<
        GeoJSON.Point,
        {
          name: string;
          geography: string | undefined;
          zip_code: string | undefined;
          primary_type: string | undefined;
          website: string | undefined;
          description: string | undefined;
          address_geocode: string | undefined;
          googlemaps_link: string | undefined;
          contact_name: string | undefined;
          contact_email: string | undefined;
          contact_phone: string | undefined;
        }
      > = {
        type: 'FeatureCollection',
        features: filteredAndMappedResources,
      };

      const geojsonSource = mapInstance.current.getSource('geojson-data') as mapboxgl.GeoJSONSource;
      if (geojsonSource) {
        geojsonSource.setData(filteredGeoJson);
      }
    }
  }, [filteredAndMappedResources, selectedAsset]);
  const zoomToAsset = (resource: GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>) => {
    const geometry = resource.geometry;

    if (geometry.type === 'Point') {
      const coordinates = geometry.coordinates as [number, number];

      // Fly to the asset on the map
      mapInstance.current!.flyTo({
        center: coordinates,
        zoom: 14,
      });

      // Set the asset as selected
      setSelectedAsset(resource);
    }
  };

  // Helper function to narrow down the type
  const isPointFeature = (
    feature: GeoJSON.Feature,
  ): feature is GeoJSON.Feature<
    GeoJSON.Point,
    {
      name: string;
      geography?: string;
      zip_code?: string;
      primary_type?: string;
      website?: string;
      description?: string;
      address_geocode?: string;
      googlemaps_link?: string;
      contact_name?: string;
      contact_email?: string;
      contact_phone?: string;
    }
  > => feature.geometry.type === 'Point';

  const totalPages = selectedAsset
    ? 1
    : Math.ceil(filteredAndMappedResources.length / ITEMS_PER_PAGE);

  const paginatedResources =
    selectedAsset && isPointFeature(selectedAsset)
      ? [selectedAsset] // Only show the selected asset in the side pane if it's a Point
      : filteredAndMappedResources
          .filter(isPointFeature) // Filter for only Point geometries
          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Function to clear search query and restore focus to search input
  const clearSearchQuery = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Restore focus to the search input
    }
  };
  const clearCountyQuery = (focusInput = false) => {
    setCountyQuery(''); // Clear the county query
    setSelectedCounty(null); // Clear the selected county
    setSelectedAsset(null); // Deselect the asset when the county is cleared
    if (focusInput && countyInputRef.current) {
      countyInputRef.current.focus(); // Focus the county input if specified
    }
    if (mapInstance.current) {
      mapInstance.current.fitBounds(northCarolinaBounds, { padding: 20 }); // Reset map view to North Carolina
    }
  };

  return (
    <div className='w-full py-4'>
      <div className='flex flex-col border-t border-[#3B75A9] lg:flex-row lg:items-start lg:space-x-16 py-4'>
        <div className='relative flex-1 lg:w-1/2 md:mb-0 mb-2'>
          <p className='my-2 font-semibold text-lg'>What are you looking for?</p>
          <label htmlFor='keyword-input' className='sr-only'>
            Keyword Search
          </label>
          <div className='relative'>
            <span className='absolute inset-y-0 left-2 flex items-center'>
              <MagnifyingGlassIcon className='h-6 w-6 text-black' aria-hidden='true' />
            </span>
            <input
              id='keyword-input'
              type='text'
              placeholder='Search for resources'
              className='w-full bg-white border border-[#3B75A9] rounded-full pl-10 pr-10 py-2 text-left cursor-default text-black'
              value={searchQuery}
              onChange={handleSearchChange}
              ref={searchInputRef}
            />
            {/* Clear Icon for Search */}
            {searchQuery && (
              <button
                className='absolute inset-y-0 right-2 flex items-center cursor-pointer'
                onClick={clearSearchQuery}
                onKeyDown={(e) => e.key === 'Enter' && clearSearchQuery()}
                tabIndex={0}
                aria-label='Clear search input'
              >
                <XMarkIcon
                  className='h-6 w-6 text-gray-400 hover:text-gray-600'
                  aria-hidden='true'
                />
              </button>
            )}
          </div>
        </div>

        {/* County Input */}
        <div className='relative flex-1 lg:w-1/2 md:mb-0 mb-2' ref={dropdownRef}>
          <p className='my-2 font-semibold text-lg'>Where are you looking?</p>
          <label htmlFor='county-input' className='sr-only'>
            County Selector
          </label>
          <div className='relative'>
            <span className='absolute inset-y-0 left-2 flex items-center'>
              <MapIcon className='h-6 w-6 text-black' aria-hidden='true' />
            </span>
            <input
              id='county-input'
              type='text'
              placeholder='Enter county or zip code'
              className='w-full bg-white border border-[#3B75A9] rounded-full pl-10 pr-10 py-2 text-left cursor-default text-black'
              value={countyQuery}
              onChange={handleCountyQueryChange}
              onFocus={() => setShowCountyOptions(true)}
              onKeyDown={handleKeyDown}
              ref={countyInputRef}
            />

            {/* Clear Icon for County */}
            {countyQuery && (
              <button
                className='absolute inset-y-0 right-2 flex items-center cursor-pointer'
                onClick={() => clearCountyQuery(false)}
                onKeyDown={(e) => e.key === 'Enter' && clearCountyQuery()}
                tabIndex={0}
                aria-label='Clear county input'
              >
                <XMarkIcon
                  className='h-6 w-6 text-gray-400 hover:text-gray-600'
                  aria-hidden='true'
                />
              </button>
            )}
          </div>

          {showCountyOptions && (
            <div className='absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm'>
              {filteredCounties.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleCountySelection(option)}
                  onMouseEnter={() => setHighlightedCountyIndex(-1)}
                  className={`cursor-default select-none relative py-2 pl-10 pr-4 text-gray-900 hover:bg-blue-600 hover:text-white ${
                    highlightedCountyIndex === index ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  <span
                    className={`block truncate ${
                      selectedCounty && selectedCounty.value === option.value
                        ? 'font-medium'
                        : 'font-normal'
                    }`}
                  >
                    {option.label} {option.type === 'County' ? 'County' : ''}
                  </span>
                  {selectedCounty && selectedCounty.value === option.value && (
                    <span className='absolute inset-y-0 left-0 flex items-center pl-3'>
                      <CheckIcon className='h-5 w-5' aria-hidden='true' />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className='border-b border-[#3B75A9] pt-2 pb-6 justify-start'>
        <div className='pb-2'>
          <p>Try searching for popular resources</p>
        </div>
        <div>
          <div className='text-md flex flex-wrap md:space-x-2'>
            {typeFilterData.options.map((option: FilterOption) => (
              <button
                aria-pressed={selectedType.includes(option.value) ? 'true' : 'false'}
                key={option.value}
                onClick={() => toggleTypeSelection(option.value)}
                className={`flex items-center px-6 py-2 mb-2 md:mb-1 rounded-full transition-colors whitespace-nowrap ${
                  selectedType.includes(option.value)
                    ? 'bg-[#1E79C8] text-white border border-white'
                    : 'bg-[#EEF7FF] text-[#092940] border border-[#3B75A9] md:hover:bg-[#3892E1] md:hover:text-white'
                } `}
              >
                {option.icon && <option.icon className='w-6 h-6 mr-2' />}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedView === 'list' ? (
        <div>
          <div className='block md:flex my-6 justify-between items-center'>
            <div>
              <p className='my-6 md:my-0 text-lg'>{getSummaryText()}</p>
            </div>
            <ViewToggle selectedView={selectedView} handleNavigate={handleViewToggle} />
          </div>

          <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 space-y-0'>
            {paginatedResources.map((resource, index) => (
              <AssetListItem key={index} resource={resource} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <div className='flex flex-col md:flex-row my-8'>
          <div
            ref={mapContainer}
            className='map-container h-[50vh] md:h-[60vh] lg:h-[80vh] w-full md:w-[55vw] md:flex-2'
            tabIndex={0}
            onKeyDown={handleMapKeyDown}
            onFocus={() => setIsMapFocused(true)}
            onBlur={() => setIsMapFocused(false)}
            aria-label='Map of Technology Resources'
          />
          <div ref={srCountyRef} className='sr-only' aria-live='assertive'></div>
          <div
            ref={assetSectionRef}
            className='h-[40vh] md:h-[60vh] lg:h-[80vh] py-6 md:py-0 md:p-4 w-full md:overflow-y-auto'
            style={{ flex: 1 }}
          >
            {/* ViewToggle Section */}
            <div className='flex justify-between items-center my-[2px]'>
              <ViewToggle selectedView={selectedView} handleNavigate={handleViewToggle} />
            </div>

            {/* Summary Text */}
            <div className='py-3'>
              <p className='my-2 md:my-4 text-lg'>{getSummaryText()}</p>
            </div>

            {/* Asset List Section */}
            <div className='space-y-4'>
              {paginatedResources.map((resource, index) => (
                <AssetListItem key={index} resource={resource} zoomToAsset={zoomToAsset} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceFinder;
