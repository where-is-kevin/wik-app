import React from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useLocation } from "@/contexts/LocationContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import CustomMarker from "./CustomMarker";
import { getMarkerColor, getMarkerIcon } from "@/utilities/map/mapHelpers";

interface CustomMapViewProps {
  mapRef: React.RefObject<MapView>;
  region: any;
  data: any[];
  selectedIndex: number;
  onMarkerPress: (index: number) => void;
  hasLocation: (item: any) => boolean;
  onRegionChange?: (region: any) => void;
}

// Memoized marker component to prevent unnecessary re-renders
const MemoizedMarker = React.memo(
  ({ item, index, isSelected, onPress }: any) => {
    const color = getMarkerColor(item.category);
    const IconComponent = getMarkerIcon(item.category);
    const numSimilarity =
      typeof item.similarity === "string"
        ? parseFloat(item.similarity)
        : item.similarity;
    const similarity = numSimilarity ? Math.round(numSimilarity * 100) : 0;

    return (
      <Marker
        key={`marker-${item.id}-${isSelected ? "sel" : "unsel"}`}
        coordinate={{
          latitude: item.latitude,
          longitude: item.longitude,
        }}
        onPress={onPress}
        tracksViewChanges={false}
      >
        <CustomMarker
          similarity={similarity}
          isSelected={isSelected}
          icon={IconComponent}
          color={color}
        />
      </Marker>
    );
  }
);

const CustomMapView: React.FC<CustomMapViewProps> = ({
  mapRef,
  region,
  data,
  selectedIndex,
  onMarkerPress,
  hasLocation,
  onRegionChange,
}) => {
  const { location: deviceLocation, permissionStatus } = useLocation();
  const { userLocation } = useUserLocation();
  const insets = useSafeAreaInsets();
  const topPosition = insets.top < 30 ? insets.top + verticalScale(10) : insets.top;

  // State for custom user location marker
  const [userLocationCoords, setUserLocationCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Get user location for custom marker
  React.useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === Location.PermissionStatus.GRANTED) {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocationCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Error getting user location for marker:', error);
      }
    };

    getUserLocation();
  }, []);

  // Function to center map on user location - gets fresh GPS coordinates
  const handleLocationPress = React.useCallback(async () => {
    try {
      // Get fresh current location directly from GPS
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Try with high accuracy first, fallback to balanced accuracy if it fails
      let currentPosition;
      try {
        currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
      } catch (highAccuracyError) {
        console.log('High accuracy location failed, trying balanced accuracy:', highAccuracyError);
        currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const realLocation = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };

      // Update the user location marker
      setUserLocationCoords(realLocation);

      if (mapRef.current) {
        const userRegion = {
          ...realLocation,
          latitudeDelta: 0.005, // Zoom in closer
          longitudeDelta: 0.005,
        };
        mapRef.current.animateToRegion(userRegion, 1000);
      }
    } catch (error) {
      console.log('Error getting current location:', error);

      // Fallback to deviceLocation if GPS fails
      if (deviceLocation && mapRef.current) {
        const userRegion = {
          latitude: deviceLocation.lat,
          longitude: deviceLocation.lon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        mapRef.current.animateToRegion(userRegion, 1000);

        // Inform user that we're using cached location
        Alert.alert(
          'Using Cached Location',
          'Unable to get fresh GPS coordinates. Using your last known location instead.',
          [{ text: 'OK' }]
        );
      } else {
        // No fallback available
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check your location settings and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [deviceLocation, mapRef]);
  // Simple filtering - no complex clustering to avoid crashes
  const validItems = data?.filter(hasLocation) || [];

  // Create mapping from validItems index to original data index
  const validItemsMapping = validItems.map((item) =>
    data.findIndex((d) => d.id === item.id)
  );

  const handleMarkerPress = (validItemIndex: number) => {
    try {
      const originalIndex = validItemsMapping[validItemIndex];
      onMarkerPress(originalIndex);
    } catch (error) {
      console.warn("Error handling marker press:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
      ref={mapRef}
      style={styles.mapContainer}
      region={region}
      onRegionChangeComplete={onRegionChange}
      zoomEnabled={true}
      scrollEnabled={true}
      rotateEnabled={false}
      pitchEnabled={false}
      showsUserLocation={false}
      showsMyLocationButton={false}
      followsUserLocation={false}
      showsCompass={false}
      userInterfaceStyle="light"
      mapType="standard"
    >
      {/* Memoized marker rendering */}
      {validItems.map((item, index) => {
        if (
          !item ||
          typeof item.latitude !== "number" ||
          typeof item.longitude !== "number"
        ) {
          return null;
        }

        const originalIndex = validItemsMapping[index];
        const isSelected = originalIndex === selectedIndex;

        return (
          <MemoizedMarker
            key={`marker-${item.id}`}
            item={item}
            index={index}
            isSelected={isSelected}
            onPress={() => handleMarkerPress(index)}
          />
        );
      })}

      {/* Custom user location marker - always visible */}
      {userLocationCoords && (
        <Marker
          coordinate={userLocationCoords}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={styles.userLocationMarker}>
            <View style={styles.userLocationDot} />
          </View>
        </Marker>
      )}
      </MapView>

      {/* Custom Location Button */}
      {deviceLocation && permissionStatus === Location.PermissionStatus.GRANTED && (
        <TouchableOpacity
          style={[styles.locationButton, { top: topPosition }]}
          onPress={handleLocationPress}
          activeOpacity={0.8}
        >
          <View style={styles.locationIcon}>
            <View style={styles.crosshair}>
              <View style={styles.crosshairInner} />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    right: horizontalScale(16), // Same right margin as back button's left margin
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)', // Exact same as back button
    borderRadius: horizontalScale(24), // Same as back button
    padding: horizontalScale(8), // Same padding as back button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshair: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#222', // Same color as back button arrow
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairInner: {
    width: 4,
    height: 4,
    backgroundColor: '#222', // Same color as back button arrow
    borderRadius: 2,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    borderWidth: 2,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
  },
});

export default CustomMapView;
