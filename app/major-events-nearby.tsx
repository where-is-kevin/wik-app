import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
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
import { Ionicons } from "@expo/vector-icons";
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface EventsScreenProps {
  // Empty interface for future props
}

const EventsScreen: React.FC<EventsScreenProps> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { userLocation } = useUserLocation();

  // Dynamic height measurements for precise animations
  const [majorEventsSectionHeight, setMajorEventsSectionHeight] = useState(0);
  const [localEventsSectionHeight, setLocalEventsSectionHeight] = useState(0);
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
    useNearbyBusinessEvents(50, 20);

  // Transform API data to MajorEventData format and manage state
  const [majorEvents, setMajorEvents] = useState<MajorEventData[]>([]);

  useEffect(() => {
    console.log("Route params:", {
      id,
      cityName,
      categoryName,
      type,
    });

    if (type === "category" && categoryName) {
      const decodedName = decodeURIComponent(categoryName);
      console.log("Setting category name to:", decodedName);
      setDisplayName(decodedName);
      setHeaderSubtitle("Events happening in");
    } else if (type === "city" && cityName) {
      const decodedName = decodeURIComponent(cityName);
      console.log("Setting city name to:", decodedName);
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
          id: event.contentId,
          title: event.name,
          location: event.addressShort || "Location",
          dateRange: formatBusinessEventDateRange(event),
          eventCount: `${event.sideEventCount}+ Events`,
          imageUrl: event.internalImageUrls?.[0] || undefined,
          isLiked: false,
        })
      );
      setMajorEvents(transformedEvents);

      // Extract side events from all business events to create local events
      const allSideEvents: LocalEventData[] = [];
      businessEventsData.events.forEach((event) => {
        if (event.sideEvents && Array.isArray(event.sideEvents)) {
          event.sideEvents.forEach((sideEvent: any, index: number) => {
            allSideEvents.push({
              id: `${event.contentId}-side-${index}`,
              title: sideEvent.title || sideEvent.name || "Local Event",
              time: sideEvent.time || sideEvent.date || "Time TBD",
              venue:
                sideEvent.venue ||
                sideEvent.location ||
                event.addressShort ||
                "Venue TBD",
              imageUrl:
                sideEvent.imageUrl ||
                sideEvent.image ||
                event.internalImageUrls?.[0],
              isLiked: false,
            });
          });
        }
      });
      // Group local events by date
      const grouped = groupEventsByDate(allSideEvents);
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
    console.log("Local event pressed:", event);
    // Navigate to event details
  };

  const handleLocalEventLike = (event: LocalEventData) => {
    setGroupedLocalEvents((prevGrouped) =>
      prevGrouped.map((group) => ({
        ...group,
        events: group.events.map((e) =>
          e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
        ),
      }))
    );
  };

  const handleEventPress = (event: MajorEventData) => {
    // Navigate to business event details
    router.push(`/business-events/${event.id}`);
  };

  const handleLikePress = (event: MajorEventData) => {
    setMajorEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
      )
    );
  };

  const handleMapPress = () => {
    // TODO: Navigate to map screen
    console.log("Map button pressed");
  };

  // Scroll handlers for snap-to behavior
  const handleScrollBeginDrag = useCallback(() => {
    // Can be used for future scroll state tracking if needed
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // Add listener to get current scroll value and handle snap
    const listener = scrollY.addListener(({ value }) => {
      // Define snap threshold for header hiding - much more responsive
      const snapThreshold = 30; // Matches our new headerContainerOpacity range

      if (value > 0 && value < snapThreshold) {
        // Snap to hidden or visible based on scroll position
        const targetValue = value > 15 ? snapThreshold : 0; // Snap at 15px midpoint
        Animated.spring(scrollY, {
          toValue: targetValue,
          useNativeDriver: false,
          tension: 200, // More responsive
          friction: 12,
        }).start();
      }
      // Remove listener after handling
      scrollY.removeListener(listener);
    });
  }, [scrollY]);

  const HEADER_HEIGHT = verticalScale(200);
  const NAVBAR_HEIGHT = verticalScale(40);
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

  // Header parallax effect - moves slower than scroll (rounded to avoid subpixel blurriness)
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, Math.round(-HEADER_HEIGHT / 3)],
    extrapolate: "clamp",
  });

  // Background image opacity - immediate fade for snap-to behavior
  const headerImageOpacity = scrollY.interpolate({
    inputRange: [-50, 0, 15, 30],
    outputRange: [0, 1, 0.2, 0],
    extrapolate: "clamp",
  });

  // Header container opacity - immediate fade for snap-to behavior
  const headerContainerOpacity = scrollY.interpolate({
    inputRange: [0, 15, 30],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  // Text slides up and fades - more responsive (rounded to avoid subpixel blurriness)
  const headerTextTranslateY = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, 15, 30],
    outputRange: [1, 0.2, 0],
    extrapolate: "clamp",
  });

  // Scale effect for header image (minimal to reduce blurriness)
  const headerImageScale = scrollY.interpolate({
    inputRange: [-100, 0, HEADER_HEIGHT],
    outputRange: [1.05, 1, 1.02],
    extrapolate: "clamp",
  });

  // Calculate section positions dynamically using measured heights
  const MAJOR_EVENTS_SECTION_END = HEADER_HEIGHT + majorEventsSectionHeight;
  const LOCAL_EVENTS_HEADER_POSITION =
    MAJOR_EVENTS_SECTION_END + verticalScale(28);

  // Use measured height for precise transition point
  const titleTransitionPoint =
    LOCAL_EVENTS_HEADER_POSITION - NAVBAR_HEIGHT - verticalScale(50);

  // Sticky header opacity for Major events - appear immediately when scrolling
  const majorEventsStickyOpacity =
    majorEvents.length > 0
      ? scrollY.interpolate({
          inputRange: [0, 10, titleTransitionPoint - 50, titleTransitionPoint],
          outputRange: [0, 1, 1, 0],
          extrapolate: "clamp",
        })
      : new Animated.Value(0);

  // Sticky header opacity for Local events - appear immediately in its section
  const localEventsStickyOpacity = scrollY.interpolate({
    inputRange: [
      titleTransitionPoint,
      titleTransitionPoint + 10,
      titleTransitionPoint + 1000, // Keep showing for a long scroll
    ],
    outputRange: [0, 1, 1],
    extrapolate: "clamp",
  });

  // Hide original Major events title when sticky appears
  const originalTitleOpacity = scrollY.interpolate({
    inputRange: [
      HEADER_HEIGHT - NAVBAR_HEIGHT - 20,
      HEADER_HEIGHT - NAVBAR_HEIGHT,
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Icon opacity for white icons - sync with navbar background
  const whiteIconOpacity = scrollY.interpolate({
    inputRange: [0, 25],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Icon opacity for black icons - sync with navbar background
  const blackIconOpacity = scrollY.interpolate({
    inputRange: [0, 25],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Dynamic padding for navbar - more at start, less when sticky
  const navBarPaddingTop = scrollY.interpolate({
    inputRange: [
      HEADER_HEIGHT - NAVBAR_HEIGHT - 30,
      HEADER_HEIGHT - NAVBAR_HEIGHT - 10,
    ],
    outputRange: [verticalScale(10), verticalScale(2)],
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
            <BackSvg stroke={colors.label_dark} />
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

      {/* Background Header with parallax */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerContainerOpacity,
          },
        ]}
        pointerEvents="none"
      >
        {/* Background Image with scale effect */}
        <Animated.Image
          source={require("@/assets/images/business_events_city.png")}
          style={[
            styles.headerBackground,
            {
              opacity: headerImageOpacity,
              transform: [{ scale: headerImageScale }],
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

        {/* Header Text Content with separate animation */}
        <Animated.View
          style={[
            styles.headerTextContainer,
            {
              opacity: headerTextOpacity,
              transform: [{ translateY: headerTextTranslateY }],
            },
          ]}
        >
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
        </Animated.View>
      </Animated.View>

      {/* Fixed Navigation Bar - Always on top */}
      <View style={styles.fixedNavBar}>
        {/* Solid background that appears when scrolled */}
        <Animated.View
          style={[
            styles.navBarBackground,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 10, 25],
                outputRange: [0, 0.8, 0.98],
                extrapolate: "clamp",
              }),
              backgroundColor: "#fff",
              height: NAVBAR_BACKGROUND_HEIGHT,
            },
          ]}
        />

        <SafeAreaView style={styles.navContainer}>
          <Animated.View
            style={[styles.navBar, { paddingTop: navBarPaddingTop }]}
          >
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <View style={{ position: "relative" }}>
                {/* White icon */}
                <Animated.View
                  style={{ opacity: whiteIconOpacity, position: "absolute" }}
                >
                  <BackSvg />
                </Animated.View>
                {/* Black icon */}
                <Animated.View style={{ opacity: blackIconOpacity }}>
                  <BackSvg stroke={colors.label_dark} />
                </Animated.View>
              </View>
            </TouchableOpacity>

            {/* Sticky Titles next to back button */}
            <View style={styles.stickyTitleContainer} pointerEvents="none">
              {/* Major events title - only show if there are major events */}
              {majorEvents.length > 0 && (
                <Animated.View
                  style={[
                    styles.absoluteTitle,
                    {
                      opacity: majorEventsStickyOpacity,
                    },
                  ]}
                >
                  <CustomText
                    fontFamily="Inter-Bold"
                    style={[
                      styles.stickyTitleText,
                      { color: colors.label_dark },
                    ]}
                  >
                    Major events
                  </CustomText>
                </Animated.View>
              )}

              {/* Local events title - only show when scrolling past its section header */}
              <Animated.View
                style={[
                  styles.absoluteTitle,
                  {
                    opacity: localEventsStickyOpacity,
                  },
                ]}
              >
                <CustomText
                  fontFamily="Inter-Bold"
                  style={[styles.stickyTitleText, { color: colors.label_dark }]}
                >
                  Local events
                </CustomText>
              </Animated.View>
            </View>

            {/* <View style={styles.navIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <View style={{ position: "relative" }}>
                  <Animated.View style={{ opacity: blackIconOpacity }}>
                    <Ionicons
                      name="search"
                      size={26}
                      color={colors.label_dark}
                    />
                  </Animated.View>
                </View>
              </TouchableOpacity>
            </View> */}
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* Scrollable Content */}
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
        overScrollMode="never"
        scrollEnabled={true}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Spacer */}
        <View
          style={[styles.headerSpacer, { backgroundColor: "transparent" }]}
        />

        {/* White background content area */}
        <View style={[styles.contentArea, { backgroundColor: "#ffffff" }]}>
          {/* Major Events Section - Show loading, events, or don't render if no data */}
          {(isBusinessEventsLoading || majorEvents.length > 0) && (
            <View
              style={styles.section}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setMajorEventsSectionHeight(height);
              }}
            >
              <Animated.View
                style={[
                  styles.sectionHeader,
                  { opacity: originalTitleOpacity },
                ]}
              >
                <SectionHeader
                  title="Major events"
                  showViewAll={false}
                  containerStyle={{ marginBottom: 0 }}
                />
              </Animated.View>

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

          {/* Local Events Section - Only render if there are local events */}
          {groupedLocalEvents.length > 0 && (
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
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setLocalEventsSectionHeight(height);
              }}
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

              {/* Render events grouped by date */}
              {groupedLocalEvents.map((dateGroup, groupIndex) => (
                <View
                  key={dateGroup.date}
                  style={{
                    marginBottom:
                      groupIndex < groupedLocalEvents.length - 1
                        ? verticalScale(20)
                        : 0,
                  }}
                >
                  <View style={styles.dateHeader}>
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
              ))}
            </View>
          )}
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
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(200),
    zIndex: 1,
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
    height: verticalScale(200),
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
    backgroundColor: "transparent",
  },
  headerSpacer: {
    height: verticalScale(200),
  },
  contentArea: {
    backgroundColor: "#fff",
    marginTop: verticalScale(-40),
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: verticalScale(25),
    paddingBottom: verticalScale(80),
    minHeight: "100%",
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
    marginTop: verticalScale(15),
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
