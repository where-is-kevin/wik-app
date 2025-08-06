import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import CustomMarker from "./CustomMarker";
import ClusterMarker from "./ClusterMarker";
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
}

interface ClusterItem {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  items: any[];
  isCluster: boolean;
  originalIndex?: number;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({
  mapRef,
  region,
  data,
  selectedIndex,
  onMarkerPress,
  hasLocation,
  userLocation,
}) => {
  // Dynamic clustering algorithm that adapts to zoom level
  const clusteredData = useMemo(() => {
    const validItems = data.filter(hasLocation);
    
    // Dynamic clustering distance based on zoom level
    // More zoomed out = larger cluster distance
    const zoomFactor = Math.max(0.001, region.latitudeDelta);
    const shouldCluster = zoomFactor > 0.02; // Start clustering when zoomed out enough
    
    if (!shouldCluster) {
      // Return individual markers when zoomed in
      return validItems.map((item, index) => ({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        count: 1,
        items: [item],
        isCluster: false,
        originalIndex: index,
      }));
    }
    
    // Dynamic cluster distance - scales with zoom level
    const baseClusterDistance = 0.005;
    const clusterDistance = baseClusterDistance * (zoomFactor / 0.02);
    
    // Precise clustering algorithm that considers cluster density
    let clusters: ClusterItem[] = [];
    const clustered = new Set();
    
    validItems.forEach((item, index) => {
      if (clustered.has(index)) return;
      
      // Find nearby items within cluster distance
      const nearbyItems: { index: number; item: any; distance: number }[] = [];
      
      validItems.forEach((otherItem, otherIndex) => {
        if (clustered.has(otherIndex) || index === otherIndex) return;
        
        const distance = Math.sqrt(
          Math.pow(item.latitude - otherItem.latitude, 2) +
          Math.pow(item.longitude - otherItem.longitude, 2)
        );
        
        if (distance < clusterDistance) {
          nearbyItems.push({ index: otherIndex, item: otherItem, distance });
        }
      });
      
      if (nearbyItems.length > 0) {
        // Sort by distance to get closest items first
        nearbyItems.sort((a, b) => a.distance - b.distance);
        
        // Build cluster incrementally, checking if each new item fits well
        const clusterItems = [{ index, item, distance: 0 }];
        const clusterCenter = { lat: item.latitude, lng: item.longitude };
        
        for (const nearby of nearbyItems) {
          // Check if this item would fit well in the current cluster
          // Calculate average distance from this item to all current cluster items
          const avgDistanceToCluster = clusterItems.reduce((sum, clusterItem) => {
            const dist = Math.sqrt(
              Math.pow(nearby.item.latitude - clusterItem.item.latitude, 2) +
              Math.pow(nearby.item.longitude - clusterItem.item.longitude, 2)
            );
            return sum + dist;
          }, 0) / clusterItems.length;
          
          // Only add to cluster if it's reasonably close to all existing items
          // Use a stricter threshold for cluster cohesion
          const maxAvgDistance = clusterDistance * 0.7; // 70% of max cluster distance
          
          if (avgDistanceToCluster < maxAvgDistance) {
            clusterItems.push(nearby);
            // Update cluster center
            const totalLat = clusterItems.reduce((sum, ci) => sum + ci.item.latitude, 0);
            const totalLng = clusterItems.reduce((sum, ci) => sum + ci.item.longitude, 0);
            clusterCenter.lat = totalLat / clusterItems.length;
            clusterCenter.lng = totalLng / clusterItems.length;
          }
        }
        
        if (clusterItems.length >= 2) { // Only create cluster if we have at least 2 items
          clusters.push({
            id: `cluster_${clusters.length}_${clusterItems.length}`,
            latitude: clusterCenter.lat,
            longitude: clusterCenter.lng,
            count: clusterItems.length,
            items: clusterItems.map(ci => ci.item),
            isCluster: true,
          });
          
          // Mark all items as clustered
          clusterItems.forEach(ci => clustered.add(ci.index));
        } else {
          // Not enough items for a good cluster, treat as individual
          clusters.push({
            id: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            count: 1,
            items: [item],
            isCluster: false,
            originalIndex: index,
          });
          clustered.add(index);
        }
      } else {
        // Single item
        clusters.push({
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          count: 1,
          items: [item],
          isCluster: false,
          originalIndex: index,
        });
        clustered.add(index);
      }
    });
    
    return clusters;
  }, [data, region.latitudeDelta, hasLocation]);

  const handleClusterPress = (cluster: ClusterItem) => {
    if (cluster.isCluster && mapRef.current) {
      // Zoom in on cluster
      const newRegion = {
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        latitudeDelta: region.latitudeDelta * 0.5,
        longitudeDelta: region.longitudeDelta * 0.5,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
    } else if (!cluster.isCluster) {
      // Handle individual marker press
      onMarkerPress(cluster.originalIndex || 0);
    }
  };

  return (
    <MapView
      ref={mapRef}
      style={styles.mapContainer}
      region={region}
      zoomEnabled={true}
      scrollEnabled={true}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {clusteredData.map((cluster) => {
        if (cluster.isCluster) {
          // Render cluster marker
          return (
            <Marker
              key={cluster.id}
              coordinate={{
                latitude: cluster.latitude,
                longitude: cluster.longitude,
              }}
              onPress={() => handleClusterPress(cluster)}
              tracksViewChanges={false}
            >
              <ClusterMarker 
                count={cluster.count} 
                onPress={() => handleClusterPress(cluster)}
              />
              <Callout tooltip>
                <View style={styles.hiddenCallout} />
              </Callout>
            </Marker>
          );
        } else {
          // Render individual marker
          const item = cluster.items[0];
          const color = getMarkerColor(item.category);
          const IconComponent = getMarkerIcon(item.category);
          const isSelected = cluster.originalIndex === selectedIndex;
          const similarity =
            "similarity" in item && item.similarity
              ? Math.round(parseFloat(item.similarity as string) * 100)
              : 98;

          return (
            <Marker
              key={cluster.id}
              coordinate={{
                latitude: cluster.latitude,
                longitude: cluster.longitude,
              }}
              onPress={() => handleClusterPress(cluster)}
              tracksViewChanges={false}
            >
              <CustomMarker
                similarity={similarity}
                isSelected={isSelected}
                icon={IconComponent}
                color={color}
              />
              <Callout tooltip>
                <View style={styles.hiddenCallout} />
              </Callout>
            </Marker>
          );
        }
      })}
      
      {/* User Location Marker */}
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          tracksViewChanges={false}
          zIndex={1000} // Ensure user location is always on top
        >
          <UserLocationMarker />
          <Callout tooltip>
            <View style={styles.hiddenCallout} />
          </Callout>
        </Marker>
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  hiddenCallout: {
    width: 0,
    height: 0,
    opacity: 0,
  },
});

export default CustomMapView;
