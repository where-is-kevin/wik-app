import { useState, useCallback } from "react";
import Constants from "expo-constants";

// Global cache to prevent duplicate API calls for same queries
const searchCache = new Map<string, VenueData[]>();
const failedQueries = new Set<string>();
const MAX_CALLS_PER_MINUTE = 10;

// Rate limiting
let callCount = 0;
let lastResetTime = Date.now();

// Google Places API response types
interface PlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: PlaceGeometry;
  types: string[];
}

interface AutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

interface PlaceDetailsResponse {
  result: PlaceDetails;
  status: string;
}

export interface VenueData {
  id: string;
  name: string;
  address: string;
  fullName: string;
  isCurrentLocation?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export const useGooglePlaces = () => {
  const [results, setResults] = useState<VenueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleMapsApiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    // Check if API key exists
    if (!googleMapsApiKey) {
      console.error('Google Maps API key not found');
      setError("API key not configured");
      return;
    }

    // Rate limiting - reset counter every minute
    const now = Date.now();
    if (now - lastResetTime > 60000) {
      callCount = 0;
      lastResetTime = now;
    }

    // Check rate limit
    if (callCount >= MAX_CALLS_PER_MINUTE) {
      console.warn('Google Places API rate limit reached');
      setError("Too many requests. Please wait a moment.");
      return;
    }

    // Check if query has failed before
    if (failedQueries.has(query)) {
      console.warn('Query previously failed, using fallback:', query);
      setResults([]);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey)!;
      setResults(cached);
      return;
    }

    setLoading(true);
    setError(null);
    callCount++; // Increment call counter

    try {
      if (!googleMapsApiKey) {
        throw new Error('API key is required');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${googleMapsApiKey}&types=establishment`
      );

      const data: AutocompleteResponse = await response.json();

      if (data.status === "OK") {
        const venueResults: VenueData[] = [];

        // Add Google Places results
        data.predictions.forEach((prediction) => {
          venueResults.push({
            id: prediction.place_id,
            name: prediction.structured_formatting.main_text,
            address: prediction.structured_formatting.secondary_text || "",
            fullName: prediction.description,
          });
        });

        // Cache successful results
        searchCache.set(cacheKey, venueResults);

        // Clean old cache entries (simple cleanup)
        if (searchCache.size > 50) {
          const firstKey = searchCache.keys().next().value;
          searchCache.delete(firstKey);
        }

        setResults(venueResults);
      } else {
        // Cache empty results to prevent repeated calls
        const emptyResults: VenueData[] = [];
        searchCache.set(cacheKey, emptyResults);
        setResults(emptyResults);
      }
    } catch (err) {
      console.error("Google Places search failed:", err);
      setError("Failed to search venues. Please try again.");

      // Add to failed queries cache to prevent retries
      failedQueries.add(query);

      // Show empty results on error
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [googleMapsApiKey]);

  const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleMapsApiKey}&fields=place_id,name,formatted_address,geometry,types`
      );

      const data: PlaceDetailsResponse = await response.json();

      if (data.status === "OK") {
        return data.result;
      } else {
        console.error("Failed to get place details:", data.status);
        return null;
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
      return null;
    }
  };

  const loadRecentVenues = useCallback(() => {
    // Start with empty results - user needs to search
    setResults([]);
  }, []);

  return {
    results,
    loading,
    error,
    searchPlaces,
    getPlaceDetails,
    loadRecentVenues,
  };
};