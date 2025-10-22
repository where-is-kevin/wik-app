import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
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
import { CityCard, CityData } from "@/components/Cards/CityCard";
import { CategoryCard, CategoryData } from "@/components/Cards/CategoryCard";
import { LinearGradient } from "expo-linear-gradient";
import BackSvg from "@/components/SvgComponents/BackSvg";
import { SectionHeader } from "@/components/Section/SectionHeader";
import FloatingMapButton from "@/components/FloatingMapButton";
import {
  useWorldwideBusinessEvents,
  BusinessEvent,
} from "@/hooks/useBusinessEvents";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { formatBusinessEventDateRange } from "@/utilities/eventHelpers";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WorldwideBusinessEventsScreenProps {}

const WorldwideBusinessEventsScreen: React.FC<
  WorldwideBusinessEventsScreenProps
> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Dynamic height measurements for precise animations
  const [majorEventsSectionHeight, setMajorEventsSectionHeight] = useState(0);
  const [citiesSectionHeight, setCitiesSectionHeight] = useState(0);
  const [localEventsSectionHeight, setLocalEventsSectionHeight] = useState(0);
  const [categoriesSectionHeight, setCategoriesSectionHeight] = useState(0);
  const insets = useSafeAreaInsets();

  // Fetch worldwide business events from API
  const {
    data: businessEventsData,
    isLoading: isBusinessEventsLoading,
    isSuccess: isBusinessEventsSuccess,
  } = useWorldwideBusinessEvents(20);

  // Transform API data to MajorEventData format and manage state
  const [majorEvents, setMajorEvents] = useState<MajorEventData[]>([]);

  // Update major events when API data loads
  useEffect(() => {
    if (businessEventsData?.events) {
      const transformedEvents: MajorEventData[] = businessEventsData.events.map(
        (event: BusinessEvent) => ({
          id: event.contentId,
          title: event.name,
          location: event.addressShort || "Worldwide",
          dateRange: formatBusinessEventDateRange(event),
          eventCount: `${event.sideEventCount}+ Events`,
          imageUrl: event.internalImageUrls?.[0] || undefined,
          isLiked: false,
        })
      );
      setMajorEvents(transformedEvents);
    }
  }, [businessEventsData]);

  // Mock cities data
  const [cities] = React.useState<CityData[]>([
    {
      id: "1",
      name: "Toronto",
      imageUrl: "https://images.unsplash.com/photo-1517935706615-2717063c2225",
    },
    {
      id: "2",
      name: "New York City",
      imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
    },
    {
      id: "3",
      name: "San Francisco",
      imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
    },
  ]);

  // Mock categories data
  const [categories] = React.useState<CategoryData[]>([
    { id: "1", name: "AI", color: "#0B2E34", icon: "hardware-chip-outline" },
    { id: "2", name: "Biotech", color: "#6A0C31", icon: "flask-outline" },
    { id: "3", name: "Travel", color: "#F84808", icon: "airplane-outline" },
  ]);

  // Mock local events data
  const [localEvents, setLocalEvents] = React.useState<LocalEventData[]>([
    {
      id: "le1",
      title: "Toronto Tech Fest",
      time: "September 10 - 13, 2025",
      venue: "Toronto, Canada",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: false,
    },
    {
      id: "le2",
      title: "Toronto Tech Fest",
      time: "September 10 - 13, 2025",
      venue: "Toronto, Canada",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: true,
    },
    {
      id: "le3",
      title: "Toronto Tech Fest",
      time: "September 10 - 13, 2025",
      venue: "Toronto, Canada",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: false,
    },
  ]);

  const handleBackPress = () => {
    router.back();
  };

  const handleEventPress = (event: MajorEventData) => {
    router.push(`/business-events/${event.id}`);
  };

  const handleLikePress = (event: MajorEventData) => {
    setMajorEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
      )
    );
  };

  const handleCityPress = (city: CityData) => {
    console.log("Navigating to city:", city);
    router.push({
      pathname: `/major-events-nearby` as any,
      params: {
        cityName: city.name,
        type: "city",
        id: city.id,
      },
    });
  };

  const handleCategoryPress = (category: CategoryData) => {
    console.log("Category pressed:", category);
    router.push({
      pathname: `/major-events-nearby` as any,
      params: {
        categoryName: category.name,
        type: "category",
        id: category.id,
      },
    });
  };

  const handleMapPress = () => {
    // TODO: Navigate to map screen
    console.log("Map button pressed");
  };

  const handleLocalEventPress = (event: LocalEventData) => {
    console.log("Local event pressed:", event);
    // Navigate to event details
  };

  const handleLocalEventLike = (event: LocalEventData) => {
    setLocalEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
      )
    );
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

  // Cleanup scroll listeners on unmount
  useEffect(() => {
    return () => {
      scrollY.removeAllListeners();
    };
  }, [scrollY]);

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

  const HEADER_HEIGHT = verticalScale(200);
  const NAVBAR_HEIGHT = verticalScale(40);
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

  // Calculate section positions using measured heights
  const SECTION_GAP = verticalScale(20);
  const CONTENT_AREA_TOP = verticalScale(-40);
  const CONTENT_PADDING_TOP = verticalScale(25);
  const CONTENT_START = HEADER_HEIGHT + CONTENT_AREA_TOP + CONTENT_PADDING_TOP;

  // Calculate transition points using measured heights with safety checks
  const CITIES_SECTION_START = Math.max(
    CONTENT_START + majorEventsSectionHeight + SECTION_GAP,
    CONTENT_START + 100 // Minimum fallback
  );
  const LOCAL_EVENTS_SECTION_START = Math.max(
    CITIES_SECTION_START + citiesSectionHeight + SECTION_GAP,
    CITIES_SECTION_START + 100 // Ensure it's always after cities
  );
  const CATEGORIES_SECTION_START = Math.max(
    LOCAL_EVENTS_SECTION_START + localEventsSectionHeight + SECTION_GAP,
    LOCAL_EVENTS_SECTION_START + 100 // Ensure it's always after local events
  );

  // Helper function to ensure monotonic inputRange
  // const createMonotonicInputRange = (
  //   baseValue: number,
  //   offset: number = 50
  // ) => {
  //   const start = Math.max(baseValue - offset, 0);
  //   const end = baseValue;
  //   return start < end ? [start, end] : [start, start + 1]; // Ensure end > start
  // };

  // Header parallax effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 3],
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

  // Text slides up and fades - more responsive
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

  // Fixed padding for navbar - no animation to prevent movement
  const navBarPaddingTop = scrollY.interpolate({
    inputRange: [
      HEADER_HEIGHT - NAVBAR_HEIGHT - 30,
      HEADER_HEIGHT - NAVBAR_HEIGHT - 10,
    ],
    outputRange: [verticalScale(10), verticalScale(2)],
    extrapolate: "clamp",
  });

  // Sticky header opacities for each section - appear immediately when scrolling
  const majorEventsStickyOpacity =
    majorEvents.length > 0
      ? scrollY.interpolate({
          inputRange: [
            0,
            10,
            Math.max(CITIES_SECTION_START - NAVBAR_HEIGHT - 70, 130),
            Math.max(CITIES_SECTION_START - NAVBAR_HEIGHT - 50, 150),
          ],
          outputRange: [0, 1, 1, 0],
          extrapolate: "clamp",
        })
      : new Animated.Value(0);

  const citiesStickyOpacity = scrollY.interpolate({
    inputRange: [
      Math.max(CITIES_SECTION_START - NAVBAR_HEIGHT - 50, 150),
      Math.max(CITIES_SECTION_START - NAVBAR_HEIGHT - 30, 170),
      Math.max(LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - 70, 230),
      Math.max(LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - 50, 250),
    ],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const localEventsStickyOpacity = scrollY.interpolate({
    inputRange: [
      Math.max(LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - 50, 250),
      Math.max(LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - 30, 270),
      Math.max(CATEGORIES_SECTION_START - NAVBAR_HEIGHT - 70, 330),
      Math.max(CATEGORIES_SECTION_START - NAVBAR_HEIGHT - 50, 350),
    ],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const categoriesStickyOpacity = scrollY.interpolate({
    inputRange: [
      Math.max(CATEGORIES_SECTION_START - NAVBAR_HEIGHT - 50, 350),
      Math.max(CATEGORIES_SECTION_START - NAVBAR_HEIGHT - 30, 370),
      Math.max(CATEGORIES_SECTION_START - NAVBAR_HEIGHT + 1000, 1400),
    ],
    outputRange: [0, 1, 1],
    extrapolate: "clamp",
  });

  // Hide original titles when sticky appears
  const originalMajorEventsOpacity = scrollY.interpolate({
    inputRange: [
      HEADER_HEIGHT - NAVBAR_HEIGHT - 20,
      HEADER_HEIGHT - NAVBAR_HEIGHT,
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const originalLocalEventsOpacity = scrollY.interpolate({
    inputRange: [
      LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - 1,
      LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT,
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const originalCategoriesOpacity = scrollY.interpolate({
    inputRange: [
      CATEGORIES_SECTION_START - NAVBAR_HEIGHT - 1,
      CATEGORIES_SECTION_START - NAVBAR_HEIGHT,
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const originalCitiesOpacity = scrollY.interpolate({
    inputRange: [
      CITIES_SECTION_START - NAVBAR_HEIGHT - 1,
      CITIES_SECTION_START - NAVBAR_HEIGHT,
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

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
          source={require("@/assets/images/business_events_global.png")}
          style={[
            styles.headerBackground,
            {
              opacity: headerImageOpacity,
              transform: [{ scale: headerImageScale }],
            },
          ]}
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
            Events happening
          </CustomText>
          <CustomText
            fontFamily="Inter-Bold"
            style={[styles.headerTitle, { color: colors.label_dark }]}
          >
            Worldwide
          </CustomText>
        </Animated.View>
      </Animated.View>

      {/* Fixed Navigation Bar */}
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
              {/* Major events title */}
              {majorEvents.length > 0 && (
                <Animated.View
                  style={[
                    styles.absoluteTitle,
                    { opacity: majorEventsStickyOpacity },
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

              {/* Cities title - Hidden until API is ready */}
              {false && (
                <Animated.View
                  style={[
                    styles.absoluteTitle,
                    { opacity: citiesStickyOpacity },
                  ]}
                >
                  <CustomText
                    fontFamily="Inter-Bold"
                    style={[
                      styles.stickyTitleText,
                      { color: colors.label_dark },
                    ]}
                  >
                    Cities
                  </CustomText>
                </Animated.View>
              )}

              {/* Local events title */}
              <Animated.View
                style={[
                  styles.absoluteTitle,
                  { opacity: localEventsStickyOpacity },
                ]}
              >
                <CustomText
                  fontFamily="Inter-Bold"
                  style={[styles.stickyTitleText, { color: colors.label_dark }]}
                >
                  Popular global events
                </CustomText>
              </Animated.View>

              {/* Categories title */}
              {false && (
                <Animated.View
                  style={[
                    styles.absoluteTitle,
                    { opacity: categoriesStickyOpacity },
                  ]}
                >
                  <CustomText
                    fontFamily="Inter-Bold"
                    style={[
                      styles.stickyTitleText,
                      { color: colors.label_dark },
                    ]}
                  >
                    Categories
                  </CustomText>
                </Animated.View>
              )}
            </View>

            <View style={styles.navIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <View style={{ position: "relative" }}>
                  {/* White icon */}
                  {/* <Animated.View
                    style={{ opacity: whiteIconOpacity, position: "absolute" }}
                  >
                    <Ionicons name="search" size={25} color="white" />
                  </Animated.View> */}
                  {/* Black icon */}
                  {/* <Animated.View style={{ opacity: blackIconOpacity }}>
                    <Ionicons
                      name="search"
                      size={25}
                      color={colors.label_dark}
                    />
                  </Animated.View> */}
                </View>
              </TouchableOpacity>
            </View>
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
      >
        {/* Header Spacer */}
        <View style={styles.headerSpacer} />

        {/* White background content area */}
        <View style={[styles.contentArea, { backgroundColor: "#ffffff" }]}>
          {/* Major Events Section - Only render if there are events */}
          {majorEvents.length > 0 && (
            <View
              style={styles.section}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setMajorEventsSectionHeight(height);
              }}
            >
              <Animated.View style={{ opacity: originalMajorEventsOpacity }}>
                <SectionHeader
                  title="Major events"
                  showViewAll={majorEvents.length >= 2}
                  onViewAllPress={() => router.push("/worldwide-major-events")}
                  containerStyle={{ marginBottom: verticalScale(12) }}
                />
              </Animated.View>

              <View style={styles.eventsGrid}>
                {majorEvents.slice(0, 3).map((event) => (
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
            </View>
          )}

          {/* Cities Section - Hidden until API is ready */}
          {false && (
            <View
              style={styles.section}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setCitiesSectionHeight(height);
              }}
            >
              <Animated.View style={{ opacity: originalCitiesOpacity }}>
                <SectionHeader
                  title="Cities"
                  showViewAll={true}
                  onViewAllPress={() => console.log("View all cities")}
                  containerStyle={{ marginBottom: verticalScale(12) }}
                />
              </Animated.View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
                style={styles.horizontalScroll}
              >
                {cities.map((city) => (
                  <CityCard
                    key={city.id}
                    city={city}
                    onPress={handleCityPress}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Local Events Section */}
          <View
            style={styles.section}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setLocalEventsSectionHeight(height);
            }}
          >
            <Animated.View style={{ opacity: originalLocalEventsOpacity }}>
              <SectionHeader
                title="Popular global events"
                showViewAll={true}
                onViewAllPress={() => console.log("View all local events")}
                containerStyle={{ marginBottom: verticalScale(12) }}
              />
            </Animated.View>

            <View style={styles.localEventsGrid}>
              {localEvents.slice(0, 3).map((event) => (
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

          {/* Categories Section - Hidden until API is ready */}
          {false && (
            <View
              style={styles.section}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setCategoriesSectionHeight(height);
              }}
            >
              <Animated.View style={{ opacity: originalCategoriesOpacity }}>
                <SectionHeader
                  title="Categories"
                  showViewAll={true}
                  onViewAllPress={() => console.log("View all categories")}
                  containerStyle={{ marginBottom: verticalScale(12) }}
                />
              </Animated.View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
                style={styles.horizontalScroll}
              >
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={handleCategoryPress}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Floating Map Button - Only show if there are any events available */}
      {(majorEvents.length > 0 || localEvents.length > 0) && (
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
  navIcons: {
    flexDirection: "row",
    gap: horizontalScale(15),
  },
  iconButton: {},
  headerTextContainer: {
    position: "absolute",
    bottom: verticalScale(24),
    left: horizontalScale(24),
    right: horizontalScale(24),
    zIndex: 5,
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
    paddingBottom: verticalScale(110),
    minHeight: "100%",
  },
  headerSubtitle: {
    fontSize: scaleFontSize(16),
  },
  headerTitle: {
    fontSize: scaleFontSize(44),
  },
  section: {
    paddingHorizontal: horizontalScale(24),
    marginTop: verticalScale(20),
  },
  eventsGrid: {
    gap: verticalScale(10),
  },
  fullWidthCard: {
    width: "100%",
    height: verticalScale(100),
    marginRight: 0,
  },
  horizontalScroll: {
    marginLeft: horizontalScale(-24),
    marginRight: horizontalScale(-24),
  },
  horizontalScrollContent: {
    paddingLeft: horizontalScale(24),
    paddingRight: horizontalScale(12),
  },
  localEventsGrid: {
    gap: verticalScale(10),
  },
  loadingContainer: {
    backgroundColor: "#fff",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  loadingBackButton: {
    padding: horizontalScale(24),
    paddingTop: verticalScale(10),
  },
  loadingCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
});

export default WorldwideBusinessEventsScreen;
