import { Platform, Linking } from "react-native";
import { trimString } from "@/utilities/stringHelpers";

export const openOnMap = async (
  googleMapsUrl: string,
  title?: string | null,
  addressShort?: string | null,
  address?: string
) => {
  if (!googleMapsUrl) {
    console.log("No Google Maps URL available for this item");
    return;
  }

  console.log("Original URL:", googleMapsUrl);

  // Extract coordinates from the URL
  const coordsMatch = googleMapsUrl.match(
    /query=(-?\d+\.?\d*),(-?\d+\.?\d*)/
  );

  if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2];
    console.log("Extracted coordinates:", lat, lng);

    if (Platform.OS === "ios") {
      // For iOS, try Apple Maps first with location name - prefer title (venue name)
      const locationName =
        trimString(title) ||
        trimString(addressShort) ||
        trimString(address) ||
        "Location";

      const encodedLocationName = encodeURIComponent(locationName);
      const appleMapsUrls = [
        `maps://?q=${encodedLocationName}&ll=${lat},${lng}`,
        `http://maps.apple.com/?q=${encodedLocationName}&ll=${lat},${lng}`,
      ];

      for (const url of appleMapsUrls) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            console.log("Successfully opened Apple Maps");
            return;
          }
        } catch (error) {
          console.log("Apple Maps failed:", error);
        }
      }

      // Fallback to Google Maps
      try {
        const googleUrl = `https://maps.google.com/?q=${encodedLocationName}&ll=${lat},${lng}`;
        await Linking.openURL(googleUrl);
        console.log("Opened Google Maps web fallback");
      } catch (error) {
        console.error("All map options failed:", error);
      }
    } else {
      // For Android, use geo intent with location name - prefer title (venue name)
      const locationName =
        trimString(title) ||
        trimString(addressShort) ||
        trimString(address) ||
        "Location";

      const encodedLocationName = encodeURIComponent(locationName);
      const androidUrls = [
        `geo:${lat},${lng}?q=${lat},${lng}(${locationName})`,
        `https://maps.google.com/?q=${encodedLocationName}&ll=${lat},${lng}`,
        `geo:0,0?q=${lat},${lng}(${locationName})`,
      ];

      for (const url of androidUrls) {
        try {
          await Linking.openURL(url);
          console.log("Successfully opened maps on Android:", url);
          return;
        } catch (error) {
          console.log("Android map URL failed:", url, error);
        }
      }
    }
  } else {
    // If coordinate extraction fails, try the original URL
    console.log("Could not extract coordinates, trying original URL");
    try {
      await Linking.openURL(googleMapsUrl);
    } catch (error) {
      console.error("Failed to open original URL:", error);
    }
  }
};