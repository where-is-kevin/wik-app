import { useState } from "react";
import { LocationData } from "@/components/Onboarding/OnboardingLocationItem";
import { createTimedAjax } from "@/utilities/apiUtils";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// API response type
type CountryGroup = {
  country: string;
  cities: string[];
};

type LocationSearchResponse = {
  groups?: CountryGroup[];
  results?: any[]; // For when the API returns empty results
  count: number;
  exact?: boolean;
  message?: string;
};

// Search locations function
const searchLocations = async (
  query?: string
): Promise<LocationSearchResponse> => {
  try {
    const url = query
      ? `${API_URL}/locations/search?q=${encodeURIComponent(query)}`
      : `${API_URL}/locations/search`;

    return await createTimedAjax<LocationSearchResponse>({
      url,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      responseType: "json",
    });
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error;
  }
};

export const useLocationSearch = () => {
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const processLocationGroups = (
    groups: CountryGroup[],
    includeCurrentLocation = true
  ): LocationData[] => {
    const locationResults: LocationData[] = [];

    // Add current location as first item only if requested
    if (includeCurrentLocation) {
      locationResults.push({
        id: "current_location",
        name: "Current Location",
        country: "",
        fullName: "Current Location",
        isCurrentLocation: true,
      });
    }

    // Process each country group
    groups.forEach((group, groupIndex) => {
      // Add country header
      locationResults.push({
        id: `header_${groupIndex}`,
        name: `${group.country}:`,
        country: group.country,
        fullName: group.country,
        isHeader: true,
      });

      // Add cities under this country
      group.cities.forEach((city, cityIndex) => {
        locationResults.push({
          id: `${group.country}_${cityIndex}`,
          name: city,
          country: group.country,
          fullName: `${city}, ${group.country}`,
        });
      });
    });

    return locationResults;
  };

  const loadAllLocations = async () => {
    setLoading(true);
    setError(null);
    setApiMessage(null);

    try {
      const response = await searchLocations(); // No query = get all locations

      // Always set the message if it exists
      if (response.message) {
        setApiMessage(response.message);
      }

      // Check if we have groups with locations
      if (response.groups && response.groups.length > 0) {
        const locationResults = processLocationGroups(response.groups);
        setResults(locationResults);
      } else {
        // No locations, just show Current Location
        const locationResults = [
          {
            id: "current_location",
            name: "Current Location",
            country: "",
            fullName: "Current Location",
            isCurrentLocation: true,
          },
        ];
        setResults(locationResults);
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
      setError("No results available. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchLocationsHandler = async (query: string) => {
    if (!query || query.length < 2) {
      // Load all locations when search is cleared
      await loadAllLocations();
      return;
    }

    setLoading(true);
    setError(null);
    setApiMessage(null);

    try {
      const response = await searchLocations(query);

      // Always set the message if it exists
      if (response.message) {
        setApiMessage(response.message);
      } else {
        setApiMessage(null);
      }

      // Check if we have groups with locations
      if (response.groups && response.groups.length > 0) {
        const locationResults = processLocationGroups(response.groups);
        setResults(locationResults);
      } else {
        // No locations, just show Current Location
        const locationResults = [
          {
            id: "current_location",
            name: "Current Location",
            country: "",
            fullName: "Current Location",
            isCurrentLocation: true,
          },
        ];
        setResults(locationResults);

        // Set a default message if none provided
        if (!response.message) {
          setApiMessage(`No locations found for "${query}"`);
        }
      }
    } catch (err) {
      console.error("Location search failed:", err);
      setError("No results available. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
    setApiMessage(null);
    setLoading(false);
  };

  return {
    results,
    loading,
    error,
    apiMessage,
    searchLocations: searchLocationsHandler,
    loadAllLocations,
    clearResults,
  };
};
