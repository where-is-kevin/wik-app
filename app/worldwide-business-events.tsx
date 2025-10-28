import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
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
import {
  formatBusinessEventDateRange,
  groupEventsByDate,
  GroupedEvent,
} from "@/utilities/eventHelpers";
import { useAddLike } from "@/hooks/useLikes";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/ToastContext";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WorldwideBusinessEventsScreenProps {}

const WorldwideBusinessEventsScreen: React.FC<
  WorldwideBusinessEventsScreenProps
> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const queryClient = useQueryClient();
  const addLikeMutation = useAddLike();
  const { showToast } = useToast();

  // Remove unused state
  const insets = useSafeAreaInsets();

  // Fetch worldwide business events from API
  const {
    data: businessEventsData,
    isLoading: isBusinessEventsLoading,
    isSuccess: isBusinessEventsSuccess,
  } = useWorldwideBusinessEvents(20);

  // Transform API data to MajorEventData format and manage state
  const [majorEvents, setMajorEvents] = useState<MajorEventData[]>([]);
  const [groupedLocalEvents, setGroupedLocalEvents] = useState<
    GroupedEvent<LocalEventData>[]
  >([]);

  // State to track current section - moved before early returns
  const [currentStickyTitle, setCurrentStickyTitle] = useState<'major' | 'local'>('major');

  // Cleanup scroll listeners on unmount - moved before early returns
  useEffect(() => {
    return () => {
      scrollY.removeAllListeners();
    };
  }, [scrollY]);

  // Dynamic calculation of local events section position
  const localEventsStart = useMemo(() => {
    let offset = 200; // Base header height

    // Add height for major events section
    if (majorEvents.length > 0) {
      offset += 80; // Section header height
      // Each major event card is roughly 120px + spacing
      const rows = Math.ceil(majorEvents.length / 1); // 1 card per row
      offset += rows * 140; // Card height + spacing
      offset += 28; // Margin between sections
    }

    return offset;
  }, [majorEvents.length]);

  // Update current section based on scroll position - moved before early returns
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (value < localEventsStart) {
        setCurrentStickyTitle('major');
      } else {
        setCurrentStickyTitle('local');
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, localEventsStart]);

  // Update major events and local events when API data loads
  useEffect(() => {
    // Transform major events
    if (businessEventsData?.events) {
      const transformedEvents: MajorEventData[] = businessEventsData.events
        // Sort by eventDatetimeStart before transforming
        .sort((a, b) => {
          const dateA = a.eventDatetimeStart ? new Date(a.eventDatetimeStart).getTime() : 0;
          const dateB = b.eventDatetimeStart ? new Date(b.eventDatetimeStart).getTime() : 0;
          return dateA - dateB; // Earliest events first
        })
        .map((event: BusinessEvent) => ({
          id: event.id || event.contentId || "",
          title: event.title || event.name || "",
          location: event.addressShort || event.addressLong || "Worldwide",
          dateRange: formatBusinessEventDateRange(event),
          eventCount: `${event.sideEventCount}+ Events`,
          imageUrl: event.imageUrl || event.internalImageUrls?.[0] || undefined,
          isLiked: event.userLiked || false,
        }));
      setMajorEvents(transformedEvents);
    }

    // Transform local events from the new localEvents array
    if (businessEventsData?.localEvents) {
      const transformedLocalEvents: LocalEventData[] = businessEventsData.localEvents
        // Sort by eventDatetimeStart before transforming
        .sort((a, b) => {
          const dateA = a.eventDatetimeStart ? new Date(a.eventDatetimeStart).getTime() : 0;
          const dateB = b.eventDatetimeStart ? new Date(b.eventDatetimeStart).getTime() : 0;
          return dateA - dateB; // Earliest events first
        })
        .map((event: BusinessEvent) => ({
          id: event.id || event.contentId || "",
          title: event.title || event.name || "",
          time: formatBusinessEventDateRange(event),
          date: event.eventDatetimeStart || undefined, // Add raw date for grouping
          venue: event.addressShort || event.addressLong || "Global",
          imageUrl: event.imageUrl || event.internalImageUrls?.[0] || undefined,
          isLiked: event.userLiked || false,
        }));

      // Group local events by date
      const grouped = groupEventsByDate(transformedLocalEvents);
      setGroupedLocalEvents(grouped);
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


  const handleBackPress = () => {
    router.back();
  };

  const handleEventPress = (event: MajorEventData) => {
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

  const handleCityPress = (city: CityData) => {
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
    router.push(`/map-screen?source=business&type=worldwide`);
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

  // Simplified scroll handlers - no complex animations
  const handleScrollBeginDrag = useCallback(() => {
    // Keep for future if needed
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // Keep for future if needed
  }, []);

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

  const NAVBAR_HEIGHT = verticalScale(40);
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

  // Simple navbar background opacity
  const navBarBackgroundOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 0.98],
    extrapolate: "clamp",
  });

  // Simple sticky header opacity
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
                  {currentStickyTitle === 'major' && majorEvents.length > 0 && 'Major events'}
                  {currentStickyTitle === 'local' && 'Popular global events'}
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
            source={require("@/assets/images/business_events_global.png")}
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
              Events happening
            </CustomText>
            <CustomText
              fontFamily="Inter-Bold"
              style={[styles.headerTitle, { color: colors.label_dark }]}
            >
              Worldwide
            </CustomText>
          </View>
        </View>

        {/* Content area */}
        <View style={[styles.contentArea, { backgroundColor: "#ffffff" }]}>
          {/* Major Events Section - Only render if there are events */}
          {majorEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SectionHeader
                  title="Major events"
                  showViewAll={false}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>

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
              // onLayout={(event) => {
              //   const { height } = event.nativeEvent.layout;
              //   setCitiesSectionHeight(height);
              // }}
            >
              {/* <Animated.View style={{ opacity: originalCitiesOpacity }}> */}
                <SectionHeader
                  title="Cities"
                  showViewAll={true}
                  onViewAllPress={() => {}}
                  containerStyle={{ marginBottom: verticalScale(12) }}
                />
              {/* </Animated.View> */}

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

          {/* Local Events Section - Always render section */}
          <View style={styles.section}>
            <CustomText
              fontFamily="Inter-Bold"
              style={[
                { fontSize: scaleFontSize(20) },
                { color: colors.label_dark },
              ]}
            >
              Popular global events
            </CustomText>

            {groupedLocalEvents.length > 0 ? (
              /* Render events grouped by date */
              groupedLocalEvents.map((dateGroup, groupIndex) => (
                <View
                  key={dateGroup.date}
                  style={{
                    marginTop: groupIndex === 0 ? verticalScale(15) : 0,
                    marginBottom:
                      groupIndex < groupedLocalEvents.length - 1
                        ? verticalScale(8)
                        : 0,
                  }}
                >
                  <View style={[
                    styles.dateHeader,
                    { marginTop: groupIndex === 0 ? verticalScale(15) : verticalScale(8) }
                  ]}>
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
                  No global events available at the moment
                </CustomText>
              </View>
            )}
          </View>

          {/* Categories Section - Hidden until API is ready */}
          {false && (
            <View
              style={styles.section}
              // onLayout={(event) => {
              //   const { height } = event.nativeEvent.layout;
              //   setCategoriesSectionHeight(height);
              // }}
            >
              {/* <Animated.View style={{ opacity: originalCategoriesOpacity }}> */}
                <SectionHeader
                  title="Categories"
                  showViewAll={true}
                  onViewAllPress={() => {}}
                  containerStyle={{ marginBottom: verticalScale(12) }}
                />
              {/* </Animated.View> */}

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
  sectionHeader: {
    marginBottom: verticalScale(12),
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
    bottom: verticalScale(20),
    left: horizontalScale(24),
    right: horizontalScale(24),
    zIndex: 5,
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
  emptyLocalEvents: {
    alignItems: "center",
    paddingVertical: verticalScale(30),
    marginTop: verticalScale(15),
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
