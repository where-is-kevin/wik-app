import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import {
  MajorEventsCard,
  MajorEventData,
} from "@/components/Cards/MajorEventsCard";
import {
  LocalEventCard,
  LocalEventData,
} from "@/components/Cards/LocalEventCard";
import { LinearGradient } from "expo-linear-gradient";
import BackSvg from "@/components/SvgComponents/BackSvg";
import { SectionHeader } from "@/components/Section/SectionHeader";
import FloatingMapButton from "@/components/FloatingMapButton";
import { useNearbyBusinessEvents } from "@/hooks/useBusinessEvents";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import {
  groupEventsByDate,
  GroupedEvent,
  formatBusinessEventDateRange,
} from "@/utilities/eventHelpers";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { useAddLike } from "@/hooks/useLikes";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/ToastContext";

interface EventsScreenProps {
  // Empty interface for future props
}

const EventsScreen: React.FC<EventsScreenProps> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { userLocation } = useUserLocation();
  const queryClient = useQueryClient();
  const addLikeMutation = useAddLike();
  const { showToast } = useToast();

  // Remove unused state
  const insets = useSafeAreaInsets();
  const { id, cityName, categoryName, type } = useLocalSearchParams<{
    id?: string;
    cityName?: string;
    categoryName?: string;
    type?: "city" | "category";
  }>();
  const getLocationDisplayName = (location: any) => {
    if (!location?.displayName) return "My Location";

    // Replace "Current Location" with "My Location"
    if (location.displayName === "Current Location") return "My Location";

    // Extract city name (first part before comma) for other locations
    return location.displayName.split(",")[0] || location.displayName;
  };

  const [displayName, setDisplayName] = useState(
    getLocationDisplayName(userLocation)
  );
  const [headerSubtitle, setHeaderSubtitle] = useState("Events happening in");

  // Fetch nearby business events from API - MUST be called before any conditional returns
  const { data: businessEventsData, isLoading: isBusinessEventsLoading } =
    useNearbyBusinessEvents(100, 20);

  // Transform API data to MajorEventData format and manage state
  const [majorEvents, setMajorEvents] = useState<MajorEventData[]>([]);

  useEffect(() => {
    if (type === "category" && categoryName) {
      const decodedName = decodeURIComponent(categoryName);
      setDisplayName(decodedName);
      setHeaderSubtitle("Events happening in");
    } else if (type === "city" && cityName) {
      const decodedName = decodeURIComponent(cityName);
      setDisplayName(decodedName);
      setHeaderSubtitle("Events happening in");
    } else {
      // No specific route params, use user location
      const locationDisplayName = getLocationDisplayName(userLocation);
      setDisplayName(locationDisplayName);
      setHeaderSubtitle("Events happening in");
    }
  }, [id, cityName, categoryName, type, userLocation]);

  // Update major events and local events when API data loads
  useEffect(() => {
    if (businessEventsData?.events) {
      const transformedEvents: MajorEventData[] = businessEventsData.events.map(
        (event) => ({
          id: event.id || event.contentId || "",
          title: event.title || event.name || "",
          location: event.addressShort || event.addressLong || "Location",
          dateRange: formatBusinessEventDateRange(event),
          eventCount: `${event.sideEventCount}+ Events`,
          imageUrl: event.imageUrl || event.internalImageUrls?.[0] || undefined,
          isLiked: event.userLiked || false,
        })
      );
      setMajorEvents(transformedEvents);

      // Use the new localEvents array from API instead of side events
      const allLocalEvents: LocalEventData[] = [];

      // First, add events from the new localEvents array
      if (businessEventsData.localEvents) {
        businessEventsData.localEvents.forEach((event) => {
          allLocalEvents.push({
            id: event.id || event.contentId || "",
            title: event.title || event.name || "Local Event",
            time: formatBusinessEventDateRange(event),
            date: event.eventDatetimeStart || undefined, // Add raw date for grouping
            venue: event.addressShort || event.addressLong || "Venue TBD",
            imageUrl: event.imageUrl || event.internalImageUrls?.[0],
            isLiked: event.userLiked || false,
          });
        });
      }

      // Fallback: Extract side events from all business events if localEvents is empty
      if (allLocalEvents.length === 0) {
        businessEventsData.events.forEach((event) => {
          if (event.sideEvents && Array.isArray(event.sideEvents)) {
            event.sideEvents.forEach((sideEvent: any, index: number) => {
              allLocalEvents.push({
                id: `${event.contentId}-side-${index}`,
                title: sideEvent.title || sideEvent.name || "Local Event",
                time: formatBusinessEventDateRange(event), // Use formatted parent event date instead of raw side event time
                date: event.eventDatetimeStart || undefined, // Add raw date for grouping
                venue:
                  sideEvent.venue ||
                  sideEvent.location ||
                  event.addressShort ||
                  "Venue TBD",
                imageUrl:
                  sideEvent.imageUrl ||
                  sideEvent.image ||
                  event.internalImageUrls?.[0],
                isLiked: event.userLiked || false,
              });
            });
          }
        });
      }

      // Group local events by date
      const grouped = groupEventsByDate(allLocalEvents);
      setGroupedLocalEvents(grouped);
    }
  }, [businessEventsData]);

  // Cleanup scroll listeners on unmount
  useEffect(() => {
    return () => {
      scrollY.removeAllListeners();
    };
  }, [scrollY]);

  const [groupedLocalEvents, setGroupedLocalEvents] = useState<
    GroupedEvent<LocalEventData>[]
  >([]);

  const handleBackPress = () => {
    router.back();
  };

  const handleLocalEventPress = (event: LocalEventData) => {
    // Navigate to event details using the [eventId].tsx route
    router.push(`/event-details/${event.id}`);
  };

  const handleLocalEventLike = (event: LocalEventData) => {
    const likeData = {
      contentIds: [event.id],
    };

    // Optimistically update local state
    setGroupedLocalEvents((prevGrouped) =>
      prevGrouped.map((group) => ({
        ...group,
        events: group.events.map((e) =>
          e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
        ),
      }))
    );

    // Make API call
    addLikeMutation.mutate(likeData, {
      onSuccess: () => {
        // Cache invalidation handled automatically by useAddLike hook
      },
      onError: (error) => {
        console.error("Failed to like local event:", error);
        // Revert optimistic update on error
        setGroupedLocalEvents((prevGrouped) =>
          prevGrouped.map((group) => ({
            ...group,
            events: group.events.map((e) =>
              e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
            ),
          }))
        );
        showToast("Failed to save your interest", "error");
      },
    });
  };

  const handleEventPress = (event: MajorEventData) => {
    // Navigate to business event details
    router.push(`/business-events/${event.id}`);
  };

  const handleLikePress = (event: MajorEventData) => {
    const likeData = {
      contentIds: [event.id],
    };

    // Optimistically update local state
    setMajorEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
      )
    );

    // Make API call
    addLikeMutation.mutate(likeData, {
      onSuccess: () => {
        // Cache invalidation handled automatically by useAddLike hook
      },
      onError: (error) => {
        console.error("Failed to like event:", error);
        // Revert optimistic update on error
        setMajorEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
          )
        );
        showToast("Failed to save your interest", "error");
      },
    });
  };

  const handleMapPress = () => {
    router.push(`/map-screen?source=business&type=nearby`);
  };

  // Simplified scroll handlers - no complex animations
  const handleScrollBeginDrag = useCallback(() => {
    // Keep for future if needed
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // Keep for future if needed
  }, []);

  const NAVBAR_HEIGHT = verticalScale(40);
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

  // Simple navbar background opacity - appears earlier
  const navBarBackgroundOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 0.98],
    extrapolate: "clamp",
  });

  // State to track current section
  const [currentStickyTitle, setCurrentStickyTitle] = useState<
    "location" | "major" | "local"
  >("location");

  // Dynamic calculation of section scroll positions based on content
  const majorEventsStart = useMemo(() => {
    // Base offset for location section + header
    let offset = 200; // Approximate height of location section

    // Add space if there are major events to show
    if (isBusinessEventsLoading || majorEvents.length > 0) {
      // This is when we want to show "Major events" in sticky header
      // Should be when the major events section title is about to scroll out of view
      return offset;
    }

    return offset;
  }, [isBusinessEventsLoading, majorEvents.length]);

  const localEventsStart = useMemo(() => {
    let offset = 200; // Base location section height

    if (isBusinessEventsLoading || majorEvents.length > 0) {
      // Add height for major events section
      offset += 80; // Section header height
      if (majorEvents.length > 0) {
        // Each major event card is roughly 120px + spacing
        const rows = Math.ceil(majorEvents.length / 1); // 1 card per row
        offset += rows * 140; // Card height + spacing
      } else if (isBusinessEventsLoading) {
        offset += 100; // Loading state height
      }
      offset += 28; // Margin between sections
    }

    return offset;
  }, [isBusinessEventsLoading, majorEvents.length]);

  // Update current section based on scroll position
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (value < 100) {
        // Not showing any sticky title yet
        return;
      } else if (value < majorEventsStart) {
        setCurrentStickyTitle("location");
      } else if (value < localEventsStart) {
        setCurrentStickyTitle("major");
      } else {
        setCurrentStickyTitle("local");
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, majorEventsStart, localEventsStart]);

  // Simple sticky header opacity - just fade in/out
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [100, 150],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Icon opacity for white icons - visible at start, fades earlier
  const whiteIconOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  // Icon opacity for black icons - appears earlier
  const blackIconOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  // Show full-screen loader while major events are loading
  if (isBusinessEventsLoading && majorEvents.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <SafeAreaView style={styles.loadingContent}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.loadingBackButton}
          >
            <BackSvg stroke={colors.label_dark} width={17} height={27} />
          </TouchableOpacity>
          <View style={styles.loadingCenter}>
            <AnimatedLoader />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Fixed Navigation Bar - Always on top */}
      <View style={styles.fixedNavBar}>
        {/* Solid background that appears when scrolled */}
        <Animated.View
          style={[
            styles.navBarBackground,
            {
              opacity: navBarBackgroundOpacity,
              backgroundColor: "#fff",
              height: NAVBAR_BACKGROUND_HEIGHT,
            },
          ]}
        />

        <SafeAreaView style={styles.navContainer}>
          <View style={[styles.navBar, { paddingTop: verticalScale(10) }]}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <View style={{ position: "relative" }}>
                {/* White icon - visible at start */}
                <Animated.View
                  style={{ opacity: whiteIconOpacity, position: "absolute" }}
                >
                  <BackSvg width={17} height={27} />
                </Animated.View>
                {/* Black icon - visible when scrolled */}
                <Animated.View style={{ opacity: blackIconOpacity }}>
                  <BackSvg stroke={colors.label_dark} width={17} height={27} />
                </Animated.View>
              </View>
            </TouchableOpacity>

            {/* Dynamic sticky title based on current section */}
            <Animated.View
              style={[
                styles.stickyTitleContainer,
                {
                  opacity: stickyHeaderOpacity,
                },
              ]}
            >
              <View style={styles.absoluteTitle}>
                <CustomText
                  fontFamily="Inter-Bold"
                  style={[styles.stickyTitleText, { color: colors.label_dark }]}
                >
                  {currentStickyTitle === "location" && displayName}
                  {currentStickyTitle === "major" &&
                    majorEvents.length > 0 &&
                    "Major events"}
                  {currentStickyTitle === "local" && "Local events"}
                </CustomText>
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>

      {/* Scrollable Content - Everything is scrollable */}
      <Animated.ScrollView
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContentContainer}
        bounces={false}
        scrollEnabled={true}
      >
        {/* Scrollable Header */}
        <View
          style={[
            styles.scrollableHeader,
            {
              height: verticalScale(200) + insets.top,
              paddingTop: insets.top,
            },
          ]}
        >
          {/* Background Image */}
          <Image
            source={require("@/assets/images/business_events_city.png")}
            style={[
              styles.headerBackground,
              {
                height: verticalScale(200) + insets.top,
              },
            ]}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              "rgba(217, 217, 217, 0.00)",
              "rgba(236, 236, 236, 0.50)",
              "#FFF",
            ]}
            locations={[0, 0.3089, 0.8089]}
            style={styles.headerGradient}
          />

          {/* Header Text Content */}
          <View style={styles.headerTextContainer}>
            <CustomText
              style={[
                styles.headerSubtitle,
                { color: colors.onboarding_option_dark },
              ]}
            >
              {headerSubtitle}
            </CustomText>
            <CustomText
              fontFamily="Inter-Bold"
              style={[styles.headerTitle, { color: colors.label_dark }]}
            >
              {displayName}
            </CustomText>
          </View>
        </View>

        {/* Content area */}
        <View style={[styles.contentArea, { backgroundColor: "#ffffff" }]}>
          {/* Major Events Section - Show loading, events, or don't render if no data */}
          {(isBusinessEventsLoading || majorEvents.length > 0) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SectionHeader
                  title="Major events"
                  showViewAll={false}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>

              {/* Loading state or events grid */}
              {isBusinessEventsLoading ? (
                <View style={styles.loadingSection}>
                  <AnimatedLoader
                    customAnimationStyle={{ width: 80, height: 80 }}
                  />
                </View>
              ) : majorEvents.length > 0 ? (
                <View style={styles.eventsGrid}>
                  {majorEvents.map((event) => (
                    <MajorEventsCard
                      key={event.id}
                      event={event}
                      onPress={handleEventPress}
                      onLikePress={handleLikePress}
                      style={styles.fullWidthCard}
                      hasTabBar={false}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptySection}>
                  <CustomText
                    style={[styles.emptyText, { color: colors.event_gray }]}
                  >
                    No major events found in this area
                  </CustomText>
                </View>
              )}
            </View>
          )}

          {/* Local Events Section - Always render section */}
          <View
            style={[
              styles.section,
              {
                marginTop:
                  majorEvents.length > 0
                    ? verticalScale(28)
                    : verticalScale(10),
                paddingTop: majorEvents.length > 0 ? 0 : verticalScale(15),
              },
            ]}
          >
            <CustomText
              fontFamily="Inter-Bold"
              style={[
                { fontSize: scaleFontSize(20) },
                { color: colors.label_dark },
              ]}
            >
              Local events
            </CustomText>

            {groupedLocalEvents.length > 0 ? (
              /* Render events grouped by date */
              groupedLocalEvents.map((dateGroup, groupIndex) => (
                <View
                  key={dateGroup.date}
                  style={{
                    marginBottom:
                      groupIndex < groupedLocalEvents.length - 1
                        ? verticalScale(8)
                        : 0,
                  }}
                >
                  <View
                    style={[
                      styles.dateHeader,
                      {
                        marginTop:
                          groupIndex === 0
                            ? verticalScale(15)
                            : verticalScale(8),
                      },
                    ]}
                  >
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[
                        styles.dateText,
                        { color: colors.onboarding_option_dark },
                      ]}
                    >
                      {dateGroup.dateLabel}
                    </CustomText>
                    <CustomText
                      style={[styles.dateSubtext, { color: colors.event_gray }]}
                    >
                      | {dateGroup.relativeLabel}
                    </CustomText>
                  </View>

                  <View style={styles.localEventsGrid}>
                    {dateGroup.events.map((event) => (
                      <LocalEventCard
                        key={event.id}
                        event={event}
                        onPress={handleLocalEventPress}
                        onLikePress={handleLocalEventLike}
                        hasTabBar={false}
                      />
                    ))}
                  </View>
                </View>
              ))
            ) : (
              /* Empty state message */
              <View style={styles.emptyLocalEvents}>
                <CustomText
                  style={[styles.emptyText, { color: colors.event_gray }]}
                >
                  No local events available at the moment
                </CustomText>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Map Button - Only show if there are events available */}
      {(majorEvents.length > 0 || groupedLocalEvents.length > 0) && (
        <FloatingMapButton onPress={handleMapPress} hasTabBar={false} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollableHeader: {
    position: "relative",
    width: "100%",
  },
  fixedNavBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    resizeMode: "cover",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  navContainer: {
    backgroundColor: "transparent",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
  },
  backButton: {},
  navIcons: {
    flexDirection: "row",
    gap: horizontalScale(16),
  },
  iconButton: {},
  headerTextContainer: {
    position: "absolute",
    bottom: verticalScale(20),
    left: horizontalScale(24),
    right: horizontalScale(24),
    zIndex: 5,
  },
  stickyTitleContainer: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },
  absoluteTitle: {
    position: "absolute",
    left: horizontalScale(16),
    right: 0,
  },
  stickyTitleText: {
    fontSize: scaleFontSize(18),
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  contentArea: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: verticalScale(25),
    paddingBottom: verticalScale(80),
    marginTop: verticalScale(-40),
  },
  headerSubtitle: {
    fontSize: scaleFontSize(16),
  },
  headerTitle: {
    fontSize: scaleFontSize(44),
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    paddingHorizontal: horizontalScale(24),
    marginTop: verticalScale(20),
  },
  sectionHeader: {
    marginBottom: verticalScale(12),
  },
  eventsGrid: {
    gap: verticalScale(10),
  },
  fullWidthCard: {
    width: "100%",
    marginRight: 0,
    height: verticalScale(100),
  },
  localEventsGrid: {
    gap: verticalScale(10),
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: horizontalScale(8),
    marginBottom: verticalScale(8),
  },
  dateText: {
    fontSize: scaleFontSize(16),
  },
  dateSubtext: {
    fontSize: scaleFontSize(14),
  },
  loadingSection: {
    alignItems: "center",
    paddingVertical: verticalScale(40),
  },
  emptySection: {
    alignItems: "center",
    paddingVertical: verticalScale(30),
  },
  emptyText: {
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
  emptyLocalEvents: {
    alignItems: "center",
    paddingVertical: verticalScale(30),
    marginTop: verticalScale(15),
  },
  loadingContainer: {
    backgroundColor: "#fff",
  },
  loadingContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingBackButton: {
    position: "absolute",
    top: verticalScale(10),
    left: horizontalScale(24),
    zIndex: 10,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EventsScreen;
