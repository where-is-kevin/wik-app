import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import CustomMarker from "./CustomMarker";
import UserLocationMarker from "./UserLocationMarker";
import { getMarkerColor, getMarkerIcon } from "@/utilities/map/mapHelpers";

interface CustomMapViewProps {
  mapRef: React.RefObject<MapView>;
  region: any;
  data: any[];
  selectedIndex: number;
  onMarkerPress: (index: number) => void;
  hasLocation: (item: any) => boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  onRegionChange?: (region: any) => void;
}

// Memoized marker component to prevent unnecessary re-renders
const MemoizedMarker = React.memo(({ item, index, isSelected, onPress }: any) => {
  const color = getMarkerColor(item.category);
  const IconComponent = getMarkerIcon(item.category);
  const numSimilarity = typeof item.similarity === 'string' ? parseFloat(item.similarity) : item.similarity;
  const similarity = numSimilarity ? Math.round(numSimilarity * 100) : 0;

  return (
    <Marker
      key={`marker-${item.id}-${isSelected ? 'sel' : 'unsel'}`}
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
});

const CustomMapView: React.FC<CustomMapViewProps> = ({
  mapRef,
  region,
  data,
  selectedIndex,
  onMarkerPress,
  hasLocation,
  userLocation,
  onRegionChange,
}) => {
  // Simple filtering - no complex clustering to avoid crashes
  const validItems = data?.filter(hasLocation) || [];
  
  // Create mapping from validItems index to original data index
  const validItemsMapping = validItems.map(item => data.findIndex(d => d.id === item.id));

  const handleMarkerPress = (validItemIndex: number) => {
    try {
      const originalIndex = validItemsMapping[validItemIndex];
      onMarkerPress(originalIndex);
    } catch (error) {
      console.warn('Error handling marker press:', error);
    }
  };

  return (
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
      toolbarEnabled={false}
      userInterfaceStyle="light"
      mapType={Platform.OS === 'android' ? 'standard' : 'standard'}
    >
      {/* Memoized marker rendering */}
      {validItems.map((item, index) => {
        if (!item || typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
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

      {/* User Location Marker */}
      {userLocation &&
        typeof userLocation.latitude === "number" &&
        typeof userLocation.longitude === "number" &&
        !isNaN(userLocation.latitude) &&
        !isNaN(userLocation.longitude) && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <UserLocationMarker />
          </Marker>
        )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
});

export default CustomMapView;
