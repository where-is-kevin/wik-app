import React from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMapsLoader } from "@/utilities/googleMapsLoader";

const containerStyle = {
  width: "100%",
  height: "100%",
};

type MapProps = {
  latitude: number;
  longitude: number;
};

export default function Map({ latitude, longitude }: MapProps) {
  const { isLoaded } = useGoogleMapsLoader();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const center = {
    lat: latitude, // Use the provided latitude
    lng: longitude, // Use the provided longitude
  };

  // Render Ionicons as a custom marker
  const customMarkerIcon = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512">
        <path d="M256 48c-79.5 0-144 64.5-144 144 0 48.1 21.5 91.2 55.4 120.4L256 464l88.6-151.6c33.9-29.2 55.4-72.3 55.4-120.4 0-79.5-64.5-144-144-144zm0 192c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z" fill="#493CFA"/>
      </svg>
    `),
    scaledSize: { width: 40, height: 40 }, // Adjust size as needed
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={{
        mapId: "e698a3c123c9505aefccc855",
        disableDefaultUI: true, // Optional: Disable default UI controls
      }}
    >
      <Marker
        position={{ lat: latitude, lng: longitude }} // Place a marker at the provided location
        title="Selected Location"
        icon={customMarkerIcon} // Use the Ionicons-based custom marker icon
      />
    </GoogleMap>
  );
}