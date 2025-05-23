import { useJsApiLoader } from "@react-google-maps/api";
import Constants from "expo-constants";

const GOOGLE_MAPS_API_KEY = Constants.expoConfig.extra.googleMapsApiKey;

const loaderOptions = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ["marker"], // Ensure consistent libraries
};

export const useGoogleMapsLoader = () => {
  return useJsApiLoader(loaderOptions);
};