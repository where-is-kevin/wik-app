import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import AskKevinSection from "@/components/Section/AskKevinSection";
import { useTheme } from "@/contexts/ThemeContext";
import { useContentWithParams } from "@/hooks/useContent";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import CustomText from "@/components/CustomText";
import { useLocationForAPI } from "@/contexts/LocationContext";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import {
  useAddBucket,
  useCreateBucket,
} from "@/hooks/useBuckets";

const PaginatedContentList = () => {
  const { query } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  const { getLocationForAPI, hasLocationPermission } = useLocationForAPI();
  
  // Handle string | string[] type from useLocalSearchParams
  const normalizeQuery = (query: string | string[] | undefined): string => {
    if (Array.isArray(query)) {
      return query[0] || "cake";
    }
    return query || "cake";
  };
  
  const [params, setParams] = useState<{
    query: string;
    limit: number;
    offset: number;
    latitude?: number;
    longitude?: number;
  }>({
    query: normalizeQuery(query),
    limit: 10,
    offset: 0,
  });
  
  const [allItems, setAllItems] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [locationInitialized, setLocationInitialized] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Bucket functionality state
  const [selectedLikeItemId, setSelectedLikeItemId] = useState<string | null>(null);
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] = useState(false);
  const [isCreateBucketBottomSheetVisible, setIsCreateBucketBottomSheetVisible] = useState(false);

  // Mutation hooks for bucket functionality
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();

  // Only call the API after location has been initialized
  const { data, isLoading, isError, refetch } = useContentWithParams(
    locationInitialized ? params : null
  );

  // Handle data updates when new data comes in
  useEffect(() => {
    if (data && data.items) {
      setHasAttemptedFetch(true);
      
      if (params.offset === 0) {
        // New search - replace all items
        setAllItems(data.items);
      } else {
        // Pagination - append new items
        setAllItems(prev => [...prev, ...data.items]);
      }
      
      // Check if we have more data - fixed logic
      const currentTotalLoaded = params.offset + data.items.length;
      setHasMore(currentTotalLoaded < data.total);
      setIsLoadingMore(false);
    } else if (data && !data.items) {
      // API returned data but no items array
      setHasAttemptedFetch(true);
      setAllItems([]);
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [data]);

  // Track when we've made our first fetch attempt
  useEffect(() => {
    if (locationInitialized && !hasAttemptedFetch) {
      // We've initialized location and are about to make our first API call
      setHasAttemptedFetch(false);
    }
  }, [locationInitialized]);

  useEffect(() => {
    const updateLocationParams = async () => {
      if (hasLocationPermission) {
        const locationData = await getLocationForAPI();
        if (locationData) {
          setParams(prevParams => {
            if (prevParams.latitude !== locationData.lat || prevParams.longitude !== locationData.lon) {
              return {
                ...prevParams,
                latitude: locationData.lat,
                longitude: locationData.lon,
              };
            }
            return prevParams;
          });
        }
      }
      setLocationInitialized(true);
    };

    updateLocationParams();
  }, [hasLocationPermission]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    
    setIsLoadingMore(true);
    
    let locationData = null;
    if (hasLocationPermission) {
      locationData = await getLocationForAPI();
    }
    
    setParams(prevParams => ({
      ...prevParams,
      offset: prevParams.offset + prevParams.limit,
      ...(locationData && {
        latitude: locationData.lat,
        longitude: locationData.lon,
      }),
    }));
  };

  const handleInputChange = (text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (text.trim() === "") {
        setAllItems([]);
        setHasMore(true);
        setHasAttemptedFetch(false);
        
        setParams(prevParams => ({
          limit: 10,
          offset: 0,
          query: "cake",
          ...(prevParams.latitude && prevParams.longitude && {
            latitude: prevParams.latitude,
            longitude: prevParams.longitude,
          }),
        }));
      }
    }, 500);
  };

  const handleSend = async (message: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Reset pagination state for new search
    setAllItems([]);
    setHasMore(true);
    setIsLoadingMore(false);
    setHasAttemptedFetch(false);

    let locationData = null;
    if (hasLocationPermission) {
      locationData = await getLocationForAPI();
    }

    const newParams = {
      query: message,
      limit: 10,
      offset: 0,
      ...(locationData && {
        latitude: locationData.lat,
        longitude: locationData.lon,
      }),
    };

    setParams(newParams);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1536236502598-7dd171f8e852?q=80&w=1974";

  // Transform data from all loaded items
  const transformedData: LikeItem[] = allItems.map((item, index) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    foodImage:
      item.internalImageUrls && item.internalImageUrls.length > 0
        ? item.internalImageUrls[0]
        : PLACEHOLDER_IMAGE,
    landscapeImage: "",
    hasIcon: true,
    height: (index % 3 === 0 ? "tall" : "short") as "short" | "tall",
  }));

  // Bucket functionality handlers
  const handleBucketPress = (likeItemId?: string) => {
    // Store the item that user wants to add to bucket
    if (likeItemId) {
      setSelectedLikeItemId(likeItemId);
    }
    setIsBucketBottomSheetVisible(true);
  };

  const handleCloseBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
  };

  const handleItemSelect = async (item: BucketItem) => {
    if (selectedLikeItemId) {
      try {
        await addBucketMutation.mutateAsync({
          id: item?.id,
          bucketName: item?.title,
          contentIds: [selectedLikeItemId],
        });

        setIsBucketBottomSheetVisible(false);
        setSelectedLikeItemId(null);

        console.log(`Successfully added item to bucket "${item.title}"`);
      } catch (error) {
        console.error("Failed to add item to bucket:", error);
      }
    }
  };

  // Create bucket bottom sheet handlers
  const handleShowCreateBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false); // Close bucket selection sheet
    setIsCreateBucketBottomSheetVisible(true); // Open create bucket sheet
  };

  const handleCloseCreateBucketBottomSheet = () => {
    setIsCreateBucketBottomSheetVisible(false);
  };

  const handleCreateBucket = async (bucketName: string) => {
    if (selectedLikeItemId) {
      try {
        // Create new bucket using the API
        await createBucketMutation.mutateAsync({
          bucketName: bucketName,
          contentIds: [selectedLikeItemId],
        });
        setIsCreateBucketBottomSheetVisible(false);

        // Clear selected item
        setSelectedLikeItemId(null);

        console.log(`Successfully created bucket "${bucketName}"`);
      } catch (error) {
        console.error("Failed to create bucket:", error);
      }
    }
  };

  // Handle item press - navigate to event details
  const handleItemPress = (item: LikeItem) => {
    router.push(`/event-details/${item.id}`);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    // Check if user has scrolled to near the bottom
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMore();
    }
  };

  // Determine if we should show the "no results" message
  const shouldShowNoResults = !isLoading && hasAttemptedFetch && transformedData.length === 0;

  return (
    <CustomView bgColor={colors.background} style={styles.container}>
      <AskKevinSection onSend={handleSend} onInputChange={handleInputChange} />
      
      {isLoading && allItems.length === 0 ? (
        <CustomView style={styles.loadingContainer}>
          <AnimatedLoader />
        </CustomView>
      ) : transformedData.length > 0 ? (
        <View style={styles.contentContainer}>
          <MasonryGrid
            data={transformedData}
            onBucketPress={handleBucketPress}
            onItemPress={handleItemPress}
            showVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={400}
            contentContainerStyle={[
              styles.masonryContentContainer,
              { paddingBottom: isLoadingMore ? 80 : 20 }
            ]}
          />
          {isLoadingMore && (
            <View style={styles.loadMoreContainer}>
              <AnimatedLoader customAnimationStyle={styles.loaderAnimation} />
            </View>
          )}
        </View>
      ) : shouldShowNoResults ? (
        <CustomView style={styles.errorContainer}>
          <CustomText style={styles.errorText}>
            No results found for "{params.query}"
          </CustomText>
          <CustomText style={styles.errorSubtext}>
            Try searching for something else
          </CustomText>
        </CustomView>
      ) : null}

      {/* Bucket Bottom Sheets */}
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
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loaderAnimation: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    flex: 1,
  },
  masonryContentContainer: {
    marginTop: verticalScale(12),
    paddingHorizontal: horizontalScale(24),
  },
  loadMoreContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default PaginatedContentList;