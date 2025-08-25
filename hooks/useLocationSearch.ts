import { useState } from "react";
import { LocationData } from "@/components/Onboarding/OnboardingLocationItem";
import Constants from "expo-constants";

const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

interface GooglePlacesPrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: {
    offset: number;
    value: string;
  }[];
}

interface GooglePlacesResponse {
  predictions: GooglePlacesPrediction[];
  status: string;
}

export const useLocationSearch = () => {
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    if (!GOOGLE_PLACES_API_KEY) {
      console.warn("Google Places API key not found");
      setError("Location search is not available");
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      // Try Google Places API first
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&types=(cities)&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GooglePlacesResponse = await response.json();

      if (data.status === "REQUEST_DENIED") {
        throw new Error("Google Places API key invalid or restricted");
      }

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const locationResults: LocationData[] = data.predictions.map(
        (prediction) => {
          const name = prediction.structured_formatting.main_text;
          const country = prediction.structured_formatting.secondary_text;

          return {
            id: prediction.place_id,
            name: name,
            country: country || "",
            fullName: prediction.description,
          };
        }
      );

      setResults(locationResults);
    } catch (err) {
      console.error("Google Places API failed:", err);
      setError("No results available. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
    setLoading(false);
  };

  return {
    results,
    loading,
    error,
    searchLocations,
    clearResults,
  };
};
