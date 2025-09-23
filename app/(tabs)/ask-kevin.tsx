import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import AskKevinSection from "@/components/Section/AskKevinSection";
import { MajorEventsSection } from "@/components/Section/MajorEventsSection";
import { MajorEventData } from "@/components/Cards/MajorEventsCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useMode } from "@/contexts/ModeContext";
import ModeHeader from "@/components/Header/ModeHeader";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomText from "@/components/CustomText";
import { useLocation } from "@/contexts/LocationContext";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import { useInfiniteContent } from "@/hooks/useContent";
import { StatusBar } from "expo-status-bar";

const PaginatedContentList = () => {
  const { query } = useLocalSearchParams();
  const { colors } = useTheme();
  const { mode } = useMode();
  const router = useRouter();
  const { location: contextLocation } = useLocation();

  // Handle string | string[] type from useLocalSearchParams
  const normalizeQuery = (query: string | string[] | undefined): string => {
    if (Array.isArray(query)) {
      return query[0] || "cake";
    }
    return query || "cake";
  };

  // State management
  const [searchQuery, setSearchQuery] = useState(normalizeQuery(query));
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use scroll direction hook with smooth animation
  const { isHeaderVisible, handleScroll } = useScrollDirection({
    threshold: 5,
    initialVisible: true,
    disabled: mode !== "business",
  });

  // Track scroll position for Major Events visibility
  const [scrollY, setScrollY] = useState(0);

  // Combined scroll handler
  const handleCombinedScroll = useCallback(
    (event: any) => {
      if (mode === "business") {
        handleScroll(event);
        setScrollY(event.nativeEvent.contentOffset.y);
      }
    },
    [mode, handleScroll]
  );

  // Check if Major Events should be visible
  const shouldShowMajorEvents =
    mode === "business" && isHeaderVisible && scrollY <= 10;

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
    latitude: contextLocation?.lat,
    longitude: contextLocation?.lon,
    limit: 20,
    enabled: true,
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

  // Sample major events data for business mode with state
  const [majorEvents, setMajorEvents] = useState<MajorEventData[]>([
    {
      id: "web-summit-2025",
      title: "WebSummit",
      location: "Lisbon",
      dateRange: "November 11 - 14, 2025",
      eventCount: "100+ Events",
      imageUrl:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000",
      isLiked: true,
    },
    {
      id: "tech-crunch-disrupt",
      title: "TechCrunch Disrupt",
      location: "San Francisco",
      dateRange: "October 28 - 30, 2025",
      eventCount: "50+ Events",
      imageUrl:
        "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1000",
      isLiked: true,
    },
    {
      id: "ces-2026",
      title: "CES 2026",
      location: "Las Vegas",
      dateRange: "January 7 - 10, 2026",
      eventCount: "200+ Events",
      imageUrl:
        "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?q=80&w=1000",
      isLiked: false,
    },
  ]);

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
    router.push(
      `/map-screen?source=content&query=${encodeURIComponent(searchQuery)}`
    );
  }, [router, searchQuery]);

  const handleItemPress = useCallback(
    (item: LikeItem) => {
      router.push(`/event-details/${item.id}`);
    },
    [router]
  );

  // Major events handlers
  const handleMajorEventPress = useCallback(
    (event: MajorEventData) => {
      router.push(`/business-events/${event.id}`);
    },
    [router]
  );

  const handleMajorEventLike = useCallback((event: MajorEventData) => {
    setMajorEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
      )
    );
  }, []);

  const handleViewAllMajorEvents = useCallback(() => {
    // TODO: Navigate to all major events page
    console.log("View all major events");
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
  const isInitialLoading = isLoading && allItems.length === 0;

  if (isInitialLoading) {
    return (
      <CustomView bgColor={colors.background} style={styles.container}>
        <CustomView
          style={[
            styles.headerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ModeHeader />

          <AskKevinSection
            onSend={handleSend}
            onInputChange={handleInputChange}
            onMapPress={handleOpenMap}
          />
        </CustomView>

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
          onMapPress={handleOpenMap}
        />
        <CustomView style={styles.errorContainer}>
          <CustomText style={styles.errorText}>
            Failed to load content
          </CustomText>
          <CustomText style={styles.errorSubtext}>
            {error?.message || "Please try again"}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <CustomText style={styles.retryButtonText}>Try Again</CustomText>
          </TouchableOpacity>
        </CustomView>
      </CustomView>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <CustomView bgColor={colors.background} style={styles.container}>
        {/* Fixed header for both modes */}
        <CustomView
          style={[
            styles.headerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ModeHeader />
          <AskKevinSection
            onSend={handleSend}
            onInputChange={handleInputChange}
            onMapPress={handleOpenMap}
          />

          {/* Major Events Section - Only show in business mode with smooth animation */}
          {shouldShowMajorEvents && (
            <MajorEventsSection
              events={majorEvents}
              onEventPress={handleMajorEventPress}
              onLikePress={handleMajorEventLike}
              onViewAllPress={handleViewAllMajorEvents}
            />
          )}

          <CustomView style={[styles.titleContainer]}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.curatedTitle, { color: colors.label_dark }]}
            >
              Curated just for you today
            </CustomText>
          </CustomView>
        </CustomView>

        {/* Content grid */}
        <CustomView style={styles.contentContainer}>
          {transformedData.length > 0 ? (
            <MasonryGrid
              data={transformedData}
              onBucketPress={handleBucketPress}
              onItemPress={handleItemPress}
              onLoadMore={handleLoadMore}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              showVerticalScrollIndicator={false}
              contentContainerStyle={styles.masonryContentContainer}
              onScroll={mode === "business" ? handleCombinedScroll : undefined}
            />
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
        </CustomView>

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
  headerContainer: {
    backgroundColor: "transparent",
  },
  titleContainer: {
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(4),
  },
  curatedTitle: {
    fontSize: scaleFontSize(16),
  },
  contentContainer: {
    flex: 1,
  },
  masonryContentContainer: {
    paddingTop: verticalScale(8),
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PaginatedContentList;
