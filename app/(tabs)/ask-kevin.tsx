import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import AskKevinSection from "@/components/Section/AskKevinSection";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import CustomText from "@/components/CustomText";
import { useLocationForAPI } from "@/contexts/LocationContext";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import { useInfiniteContent } from "@/hooks/useContent";
import { StatusBar } from "expo-status-bar";
import FloatingMapButton from "@/components/FloatingMapButton";

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

  // State management
  const [searchQuery, setSearchQuery] = useState(normalizeQuery(query));
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locationInitialized, setLocationInitialized] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Bucket functionality state
  const [selectedLikeItemId, setSelectedLikeItemId] = useState<string | null>(
    null
  );
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);

  // Mutation hooks for bucket functionality
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();

  // Initialize location
  useEffect(() => {
    const initLocation = async () => {
      if (hasLocationPermission) {
        try {
          const locationData = await getLocationForAPI();
          if (locationData) {
            setLocation(locationData);
          }
        } catch (error) {
          console.log("Failed to get location, proceeding without it");
        }
      }
      setLocationInitialized(true);
    };
    initLocation();
  }, [hasLocationPermission, getLocationForAPI]);

  // Use infinite query - works with or without location
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteContent({
    query: searchQuery,
    latitude: location?.lat,
    longitude: location?.lon,
    limit: 20,
    enabled: locationInitialized,
  });

  // Flatten all pages into single array
  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  // Transform data for MasonryGrid
  const PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1536236502598-7dd171f8e852?q=80&w=1974";

  const transformedData: LikeItem[] = allItems.map((item, index) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    foodImage: item.internalImageUrls?.[0] || PLACEHOLDER_IMAGE,
    landscapeImage: "",
    hasIcon: true,
    contentShareUrl: item.contentShareUrl,
    height: (index % 3 === 0 ? "tall" : "short") as "short" | "tall",
  }));

  // Handle input change with debounce
  const handleInputChange = useCallback((text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (text.trim() === "") {
        setSearchQuery("cake");
      }
    }, 500);
  }, []);

  // Handle search submission
  const handleSend = useCallback((message: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setSearchQuery(message);
  }, []);

  // Clean infinite pagination handler
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Clean refresh handler
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Bucket functionality handlers
  const handleBucketPress = useCallback((likeItemId?: string) => {
    if (likeItemId) {
      setSelectedLikeItemId(likeItemId);
    }
    setIsBucketBottomSheetVisible(true);
  }, []);

  const handleCloseBucketBottomSheet = useCallback(() => {
    setIsBucketBottomSheetVisible(false);
  }, []);

  const handleItemSelect = useCallback(
    async (item: BucketItem) => {
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

  const handleShowCreateBucketBottomSheet = useCallback(() => {
    setIsBucketBottomSheetVisible(false);
    setIsCreateBucketBottomSheetVisible(true);
  }, []);

  const handleCloseCreateBucketBottomSheet = useCallback(() => {
    setIsCreateBucketBottomSheetVisible(false);
  }, []);

  const handleCreateBucket = useCallback(
    async (bucketName: string) => {
      if (selectedLikeItemId) {
        try {
          await createBucketMutation.mutateAsync({
            bucketName: bucketName,
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

  // Map navigation handler
  const handleOpenMap = useCallback(() => {
    router.push(`/map-screen?source=content&query=${encodeURIComponent(searchQuery)}`);
  }, [router, searchQuery]);

  const handleItemPress = useCallback(
    (item: LikeItem) => {
      router.push(`/event-details/${item.id}`);
    },
    [router]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
  const isInitialLoading =
    !locationInitialized || (isLoading && allItems.length === 0);
  const isRefreshing = isLoading && !!data;

  if (isInitialLoading) {
    return (
      <CustomView bgColor={colors.background} style={styles.container}>
        <AskKevinSection
          onSend={handleSend}
          onInputChange={handleInputChange}
        />
        <CustomView style={styles.loadingContainer}>
          <AnimatedLoader />
        </CustomView>
      </CustomView>
    );
  }

  // Error state
  if (isError) {
    return (
      <CustomView bgColor={colors.background} style={styles.container}>
        <AskKevinSection
          onSend={handleSend}
          onInputChange={handleInputChange}
        />
        <CustomView style={styles.errorContainer}>
          <CustomText style={styles.errorText}>
            Failed to load content
          </CustomText>
          <CustomText style={styles.errorSubtext}>
            {error?.message || "Please try again"}
          </CustomText>
        </CustomView>
      </CustomView>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <CustomView bgColor={colors.background} style={styles.container}>
        <AskKevinSection
          onSend={handleSend}
          onInputChange={handleInputChange}
        />

        {transformedData.length > 0 ? (
          <View style={styles.contentContainer}>
            <MasonryGrid
              data={transformedData}
              onBucketPress={handleBucketPress}
              onItemPress={handleItemPress}
              onLoadMore={handleLoadMore}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              showVerticalScrollIndicator={false}
              contentContainerStyle={styles.masonryContentContainer}
            />
          </View>
        ) : (
          <CustomView style={styles.errorContainer}>
            <CustomText style={styles.errorText}>
              No results found for "{searchQuery}"
            </CustomText>
            <CustomText style={styles.errorSubtext}>
              Try searching for something else
            </CustomText>
          </CustomView>
        )}

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
        
        {/* Floating Map Button */}
        {allItems.length > 0 && (
          <FloatingMapButton onPress={handleOpenMap} />
        )}
      </CustomView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  masonryContentContainer: {
    marginTop: verticalScale(12),
    paddingHorizontal: horizontalScale(24),
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
