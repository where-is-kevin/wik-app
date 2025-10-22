import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import AskKevinSection from "@/components/Section/AskKevinSection";
import { MajorEventsSection } from "@/components/Section/MajorEventsSection";
import { MajorEventData } from "@/components/Cards/MajorEventsCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useMode } from "@/contexts/ModeContext";
import { useToast } from "@/contexts/ToastContext";
import ModeHeader from "@/components/Header/ModeHeader";
import FloatingMapButton from "@/components/FloatingMapButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import MasonryGrid, { LikeItem } from "@/components/MansoryGrid";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import CustomText from "@/components/CustomText";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { useLocation } from "@/contexts/LocationContext";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import { useInfiniteContent } from "@/hooks/useContent";
import { formatBusinessEventDateRange } from "@/utilities/eventHelpers";
import {
  useConfigurableBusinessEvents,
  BusinessEvent,
} from "@/hooks/useBusinessEvents";
import { useAddLike } from "@/hooks/useLikes";
import { StatusBar } from "expo-status-bar";
import { ErrorScreen } from "@/components/ErrorScreen";

const PaginatedContentList = () => {
  const { query } = useLocalSearchParams();
  const { colors } = useTheme();
  const { mode } = useMode();
  const { showToast } = useToast();
  const router = useRouter();
  const { getApiLocationParams, userLocation } = useUserLocation();
  const { location: deviceLocation } = useLocation();

  // Handle string | string[] type from useLocalSearchParams
  const normalizeQuery = (query: string | string[] | undefined): string => {
    if (Array.isArray(query)) {
      return query[0] || "";
    }
    return query || "";
  };

  // State management
  const [searchQuery, setSearchQuery] = useState(normalizeQuery(query));
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [majorEventsHeight, setMajorEventsHeight] = useState(0);

  // Check if Major Events should be visible (only for business mode and no search query)
  const shouldShowMajorEvents = mode === "business" && !searchQuery.trim();

  // === SCROLL ANIMATION STATE ===
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Scroll tracking refs
  const scrollYRef = useRef(0);
  const lastScrollY = useRef(0);

  // Reanimated values for smooth animations
  const headerOpacity = useSharedValue(1);
  const headerHeight = useSharedValue(1);
  const contentMarginTop = useSharedValue(0);

  // === ANIMATED STYLES ===
  const majorEventsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scaleY: headerHeight.value }],
    overflow: "hidden" as const,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    marginTop: contentMarginTop.value,
  }));

  // === SCROLL HANDLERS ===
  // Animation helper function
  const triggerHeaderAnimation = useCallback(
    (shouldHide: boolean) => {
      setIsHeaderHidden(shouldHide);

      const animationConfig = {
        duration: shouldHide ? 250 : 150, // Show faster than hide
        easing: shouldHide ? Easing.out(Easing.quad) : Easing.out(Easing.cubic),
      };

      if (shouldHide) {
        // Hide: fade out, scale down, move content up
        headerOpacity.value = withTiming(0, animationConfig);
        headerHeight.value = withTiming(0, animationConfig);
        contentMarginTop.value = withTiming(
          -majorEventsHeight,
          animationConfig
        );
      } else {
        // Show: fade in, scale up, move content down
        headerOpacity.value = withTiming(1, animationConfig);
        headerHeight.value = withTiming(1, animationConfig);
        contentMarginTop.value = withTiming(0, animationConfig);
      }
    },
    [headerOpacity, headerHeight, contentMarginTop, majorEventsHeight]
  );

  // Handle scroll events - track direction and immediate show near top
  const handleScroll = useCallback(
    (event: any) => {
      // Only handle scroll animation if major events section is visible
      if (!shouldShowMajorEvents) return;

      const currentScrollY = Math.max(0, event.nativeEvent.contentOffset.y);
      scrollYRef.current = currentScrollY;

      lastScrollY.current = currentScrollY;

      // Show immediately when at the top (0-5px) and not dragging
      if (!isDragging && currentScrollY <= 5 && isHeaderHidden) {
        triggerHeaderAnimation(false);
      }
    },
    [isDragging, isHeaderHidden, triggerHeaderAnimation, shouldShowMajorEvents]
  );

  // Drag handlers
  const handleScrollBeginDrag = useCallback(() => {
    // Only set dragging state if major events section is visible
    if (!shouldShowMajorEvents) return;
    setIsDragging(true);
  }, [shouldShowMajorEvents]);

  // Check position and update header visibility
  const checkScrollPosition = useCallback(() => {
    // Only handle scroll position check if major events section is visible
    if (!shouldShowMajorEvents) return;

    const currentScrollY = Math.max(0, scrollYRef.current);

    let shouldHide;
    if (currentScrollY <= 5) {
      shouldHide = false; // Show: when at the top
    } else if (currentScrollY > 40) {
      shouldHide = true; // Hide: when scrolled down significantly
    } else {
      shouldHide = isHeaderHidden; // Keep current state in transition zone (5-40px)
    }

    if (shouldHide !== isHeaderHidden) {
      triggerHeaderAnimation(shouldHide);
    }
  }, [isHeaderHidden, triggerHeaderAnimation, shouldShowMajorEvents]);

  const handleScrollEndDrag = useCallback(() => {
    // Only handle drag end if major events section is visible
    if (!shouldShowMajorEvents) return;
    setIsDragging(false);
    checkScrollPosition();
  }, [checkScrollPosition, shouldShowMajorEvents]);

  // Also check when momentum scroll ends
  const handleMomentumScrollEnd = useCallback(() => {
    // Only handle momentum scroll end if major events section is visible
    if (!shouldShowMajorEvents) return;
    checkScrollPosition();
  }, [checkScrollPosition, shouldShowMajorEvents]);

  // Reset animation values when major events are hidden (due to search)
  useEffect(() => {
    if (!shouldShowMajorEvents) {
      // When major events are hidden, reset animation values to normal state
      setIsHeaderHidden(false);
      headerOpacity.value = withTiming(1, { duration: 0 });
      headerHeight.value = withTiming(1, { duration: 0 });
      contentMarginTop.value = withTiming(0, { duration: 0 });
    }
  }, [shouldShowMajorEvents, headerOpacity, headerHeight, contentMarginTop]);

  // === BUCKET FUNCTIONALITY ===
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

  // Mutation hook for likes
  const addLikeMutation = useAddLike();

  // Use infinite query - works with or without location
  // Get location params - only includes lat/lng if user chose "Current Location"
  const locationParams = getApiLocationParams(deviceLocation || undefined);

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
    ...locationParams, // Conditionally spread lat/lng
    limit: 12,
    enabled: true,
    type: mode, // Pass the current mode as type
  });

  // Get all items - memoized for performance
  const allItems = useMemo(() =>
    data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  // Transform data for MasonryGrid - memoized for performance
  const transformedData: LikeItem[] = useMemo(() =>
    allItems.map((item, index) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      foodImage: item.internalImageUrls?.[0] || "", // Empty string will show SVG placeholder
      landscapeImage: "",
      hasIcon: true,
      contentShareUrl: item.contentShareUrl,
      height: (index % 3 === 0 ? "tall" : "short") as "short" | "tall",
    })), [allItems]);

  // State for event type selection (nearby vs worldwide)
  const [selectedEventType, setSelectedEventType] = useState<
    "nearby" | "worldwide"
  >("worldwide");

  // Use configurable hook that responds to selectedEventType changes
  const {
    data: businessEventsData,
    isLoading: isBusinessEventsLoading,
    isSuccess: isBusinessEventsSuccess
  } = useConfigurableBusinessEvents(selectedEventType, {
      limit: 5,
      radiusKm: 50,
    });

  // Transform API data to MajorEventData format and manage state
  const [majorEvents, setMajorEvents] = useState<MajorEventData[]>([]);

  // Update major events when API data loads
  const transformedEvents = useMemo(() => {
    if (!businessEventsData?.events) return [];

    return businessEventsData.events
      .slice(0, 5) // Limit to maximum 5 events
      .map((event: BusinessEvent) => ({
        id: event.contentId,
        title: event.name,
        location: event.addressShort || "",
        dateRange: formatBusinessEventDateRange(event),
        eventCount: `${event.sideEventCount}+ Events`,
        imageUrl: event.internalImageUrls?.[0] || undefined,
        isLiked: false,
      }));
  }, [businessEventsData?.events]);

  useEffect(() => {
    // Only update majorEvents if we have actual data or the query was successful
    // This prevents clearing events when data is temporarily empty during loading
    if (transformedEvents.length > 0 || isBusinessEventsSuccess) {
      setMajorEvents(transformedEvents);
    }
  }, [transformedEvents, isBusinessEventsSuccess]);

  // Handle input change with debounce
  const handleInputChange = useCallback((text: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (text.trim() === "") {
        setSearchQuery("");
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

  // Handle clear search
  const handleClear = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setSearchQuery(""); // Reset to initial state without any params
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
          showToast("Added to bucket", "success");
        } catch {
          showToast("Failed to add to bucket", "error");
        }
      }
    },
    [selectedLikeItemId, addBucketMutation, showToast]
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
          showToast("Bucket created", "success");
        } catch {
          showToast("Failed to create bucket", "error");
        }
      }
    },
    [selectedLikeItemId, createBucketMutation, showToast]
  );

  // === NAVIGATION HANDLERS ===
  const handleOpenMap = useCallback(() => {
    router.push(
      `/map-screen?source=content&query=${encodeURIComponent(
        searchQuery
      )}&type=${mode}`
    );
  }, [router, searchQuery, mode]);

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

  const handleMajorEventLike = useCallback(
    (event: MajorEventData) => {
      const likeData = {
        contentIds: [event.id],
      };

      // Optimistic update - immediately toggle the like state
      setMajorEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
        )
      );

      addLikeMutation.mutate(likeData, {
        onSuccess: () => {
          showToast(
            "Liked! Finding you similar suggestions nearby.",
            "success"
          );
        },
        onError: (error) => {
          console.error("Failed to add like:", error);
          // Revert optimistic update on error
          setMajorEvents((prevEvents) =>
            prevEvents.map((e) =>
              e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
            )
          );
          showToast("Failed to like event", "error");
        },
      });
    },
    [addLikeMutation, showToast]
  );


  // === CLEANUP ===
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // === RENDER LOGIC ===
  // Loading state - show full screen loader for initial load of content and major events
  const isInitialLoading =
    (isLoading && allItems.length === 0) ||
    (shouldShowMajorEvents && isBusinessEventsLoading && majorEvents.length === 0 && allItems.length === 0);

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
            onClear={handleClear}
            value={searchQuery}
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
          onClear={handleClear}
          value={searchQuery}
        />
        <ErrorScreen
          title="Failed to load content"
          message={error?.message || "Please try again"}
          onRetry={() => refetch()}
        />

        {/* Floating Map Button - Only show if there's data available */}
        {transformedData.length > 0 && (
          <FloatingMapButton onPress={handleOpenMap} hasTabBar={true} />
        )}
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
            onClear={handleClear}
            value={searchQuery}
          />

          {/* Major Events Section - Only show in business mode with smooth animation */}
          {shouldShowMajorEvents && (
            <Animated.View
              style={majorEventsAnimatedStyle}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setMajorEventsHeight(height);
              }}
            >
              <MajorEventsSection
                events={majorEvents}
                selectedEventType={selectedEventType}
                onEventTypeChange={setSelectedEventType}
                onEventPress={handleMajorEventPress}
                onLikePress={handleMajorEventLike}
                isLoading={isBusinessEventsLoading}
                isSuccess={isBusinessEventsSuccess}
                location={userLocation?.displayName || "Current Location"}
              />
            </Animated.View>
          )}
        </CustomView>

        {/* Content section - animated to move up when header hides */}
        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
          <CustomView style={[styles.titleContainer]}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.curatedTitle, { color: colors.label_dark }]}
            >
              Curated just for you today
            </CustomText>
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
                onScroll={shouldShowMajorEvents ? handleScroll : undefined}
                onScrollBeginDrag={
                  shouldShowMajorEvents ? handleScrollBeginDrag : undefined
                }
                onScrollEndDrag={
                  shouldShowMajorEvents ? handleScrollEndDrag : undefined
                }
                onMomentumScrollEnd={
                  shouldShowMajorEvents ? handleMomentumScrollEnd : undefined
                }
                scrollEventThrottle={16}
              />
            ) : (
              <ErrorScreen
                title={`No results found`}
                message="Try searching for something else or changing mode"
              />
            )}
          </CustomView>
        </Animated.View>

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

        {/* Floating Map Button - Only show if there's data available */}
        {transformedData.length > 0 && (
          <FloatingMapButton onPress={handleOpenMap} hasTabBar={true} />
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
    paddingBottom: verticalScale(20),
  },
});

export default PaginatedContentList;
