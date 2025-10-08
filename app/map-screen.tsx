import React from "react";
import { View, Dimensions, FlatList, StyleSheet, Platform } from "react-native";
import MapView from "react-native-maps";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import MapHeader from "@/components/MapScreen/MapHeader";
import MapLoadingState from "@/components/MapScreen/MapLoadingState";
import MapErrorState from "@/components/MapScreen/MapErrorState";
import MapEmptyState from "@/components/MapScreen/MapEmptyState";
import CustomMapView from "@/components/MapScreen/CustomMapView";
import MapCardList from "@/components/MapScreen/MapCardList";
import { BucketBottomSheet } from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { useMapData, hasLocation } from "@/hooks/useMapData";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import { useAnalyticsContext } from "@/contexts/AnalyticsContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { useLocation } from "@/contexts/LocationContext";

const MapScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { trackScreenView, trackButtonClick } = useAnalyticsContext();
  const { getApiLocationParams } = useUserLocation();
  const { location: deviceLocation } = useLocation();

  // Get source and query from route params, default to likes
  const source = (params.source as string) || "likes";
  const searchQuery = (params.query as string) || "";
  const bucketId = params.bucketId as string;
  const type = params.type as "leisure" | "business" | undefined;

  // Get location params - only includes lat/lng if user chose "Current Location"
  const locationParams = getApiLocationParams(deviceLocation || undefined);

  // Use custom hook for data management
  const {
    data,
    isLoading,
    isError,
    locationLoading,
    locationError,
  } = useMapData(source, searchQuery, bucketId, type, locationParams);

  const mapRef = React.useRef<MapView>(null);
  const flatListRef = React.useRef<FlatList>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Bucket functionality state
  const [selectedLikeItemId, setSelectedLikeItemId] = React.useState<
    string | null
  >(null);
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    React.useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = React.useState(false);

  // Bucket mutations
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();

  const [region, setRegion] = React.useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [mapKey, setMapKey] = React.useState(0);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleRegionChange = React.useCallback(() => {
    // Just a simple callback for now
  }, []);

  // Track screen view when component mounts
  React.useEffect(() => {
    trackScreenView("map_screen", {
      source,
      search_query: searchQuery,
      bucket_id: bucketId || "none",
      items_count: data.length,
    });
  }, [trackScreenView, source, searchQuery, bucketId, data.length]);

  // Initialize region when data is loaded
  React.useEffect(() => {
    if (data.length > 0) {
      const firstItemWithLocation = data.find(hasLocation);
      if (firstItemWithLocation) {
        const newRegion = {
          latitude: firstItemWithLocation.latitude,
          longitude: firstItemWithLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
      }
    }
  }, [data]);

  // Android-only: Force map remount when returning from event details (Expo 52 bug fix)
  useFocusEffect(
    React.useCallback(() => {
      if (isNavigating && Platform.OS === "android") {
        setMapKey((prev) => prev + 1);
      }
      if (isNavigating) {
        setIsNavigating(false);
      }
    }, [isNavigating])
  );

  // Animate to selected item when index changes
  React.useEffect(() => {
    if (
      data &&
      data.length > 0 &&
      selectedIndex < data.length &&
      mapRef.current
    ) {
      const selectedItem = data[selectedIndex];
      if (hasLocation(selectedItem)) {
        const newRegion = {
          latitude: selectedItem.latitude,
          longitude: selectedItem.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1500);
        }
      }
    }
  }, [selectedIndex, data]);

  const CARD_WIDTH = Dimensions.get("window").width * 0.85; // 85% of screen width
  const CARD_SPACING = 12;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

  const onScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index !== selectedIndex && index >= 0 && index < data.length) {
      setSelectedIndex(index);
    }
  };

  const onMarkerPress = (index: number) => {
    setSelectedIndex(index);
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: index * SNAP_INTERVAL,
        animated: true,
      });
    }
  };

  const handleCardPress = React.useCallback(
    (item: any) => {
      setIsNavigating(true);
      router.push(`/event-details/${item.id}`);
    },
    [router]
  );

  // Bucket functionality handlers
  const handleShowBucketBottomSheet = React.useCallback(
    (likeItemId?: string) => {
      if (likeItemId) {
        setSelectedLikeItemId(likeItemId);
      }
      setIsBucketBottomSheetVisible(true);
    },
    []
  );

  const handleCloseBucketBottomSheet = React.useCallback(() => {
    setIsBucketBottomSheetVisible(false);
  }, []);

  const handleItemSelect = React.useCallback(
    async (item: any) => {
      if (selectedLikeItemId) {
        try {
          await addBucketMutation.mutateAsync({
            id: item?.id,
            bucketName: item?.title,
            contentIds: [selectedLikeItemId],
          });
          setIsBucketBottomSheetVisible(false);
          setSelectedLikeItemId(null);
        } catch (error) {
          console.error("Failed to add item to bucket:", error);
        }
      }
    },
    [selectedLikeItemId, addBucketMutation]
  );

  const handleShowCreateBucketBottomSheet = React.useCallback(() => {
    setIsBucketBottomSheetVisible(false);
    setIsCreateBucketBottomSheetVisible(true);
  }, []);

  const handleCloseCreateBucketBottomSheet = React.useCallback(() => {
    setIsCreateBucketBottomSheetVisible(false);
  }, []);

  const handleCreateBucket = React.useCallback(
    async (bucketName: string) => {
      if (selectedLikeItemId) {
        try {
          await createBucketMutation.mutateAsync({
            bucketName,
            contentIds: [selectedLikeItemId],
          });
          setIsCreateBucketBottomSheetVisible(false);
          setSelectedLikeItemId(null);
        } catch (error) {
          console.error("Failed to create bucket:", error);
        }
      }
    },
    [selectedLikeItemId, createBucketMutation]
  );

  // Loading state
  if (isLoading) {
    return (
      <MapLoadingState
        onBack={() => router.back()}
        source={source}
        locationLoading={locationLoading}
        locationError={locationError}
      />
    );
  }

  // Error state
  if (isError) {
    return <MapErrorState onBack={() => router.back()} source={source} />;
  }

  // Empty state
  if (data.length === 0) {
    return <MapEmptyState onBack={() => router.back()} source={source} />;
  }

  return (
    <View style={styles.container}>
      <MapHeader
        onBack={() => {
          trackButtonClick("map_back_button", { source, screen: "map_screen" });
          router.back();
        }}
      />

      <CustomMapView
        key={Platform.OS === "android" ? `map-${mapKey}` : "map-ios"}
        mapRef={mapRef}
        region={region}
        data={data}
        selectedIndex={selectedIndex}
        onMarkerPress={onMarkerPress}
        hasLocation={hasLocation}
        onRegionChange={handleRegionChange}
      />

      <MapCardList
        data={data}
        selectedIndex={selectedIndex}
        onScrollEnd={onScrollEnd}
        onCardPress={handleCardPress}
        onBucketPress={handleShowBucketBottomSheet}
        flatListRef={flatListRef}
      />

      {/* Bottom Sheets */}
      <BucketBottomSheet
        selectedLikeItemId={selectedLikeItemId}
        isVisible={isBucketBottomSheetVisible}
        onClose={handleCloseBucketBottomSheet}
        onItemSelect={handleItemSelect}
        onCreateNew={handleShowCreateBucketBottomSheet}
      />

      <CreateBucketBottomSheet
        isVisible={isCreateBucketBottomSheetVisible}
        onClose={handleCloseCreateBucketBottomSheet}
        onCreateBucket={handleCreateBucket}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapScreen;
