import React, { useRef, useEffect, useState } from "react";
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface EventsScreenProps {
  // Empty interface for future props
}

const EventsScreen: React.FC<EventsScreenProps> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { id, cityName, categoryName, type } =
    useLocalSearchParams<{
      id?: string;
      cityName?: string;
      categoryName?: string;
      type?: "city" | "category";
    }>();
  const [displayName, setDisplayName] = useState("Lisbon");
  const [headerSubtitle, setHeaderSubtitle] = useState("Events happening in");

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
    }
  }, [id, cityName, categoryName, type]);

  // Mock data - replace with actual data from your API
  const [majorEvents, setMajorEvents] = React.useState<MajorEventData[]>([
    {
      id: "1",
      title: "WebSummit",
      location: "Lisbon",
      dateRange: "November 11 - 14, 2025",
      eventCount: "100+ Events",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: false,
    },
    {
      id: "2",
      title: "WebSummit",
      location: "Lisbon",
      dateRange: "November 11 - 14, 2025",
      eventCount: "100+ Events",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: true,
    },
  ]);

  const [localEvents, setLocalEvents] = React.useState<LocalEventData[]>([
    {
      id: "3",
      title: "WebSummit - Day 1",
      time: "10:00 AM - 3:30 PM",
      venue: "MEO Arena",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: false,
    },
    {
      id: "4",
      title: "Startup Pitch Competition",
      time: "2:00 PM - 5:00 PM",
      venue: "FIL Convention Center",
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
      isLiked: true,
    },
    {
      id: "5",
      title: "Tech Networking Mixer",
      time: "6:30 PM - 9:00 PM",
      venue: "Rooftop Bar Silk Club",
      imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865",
      isLiked: false,
    },
    {
      id: "6",
      title: "AI & Machine Learning Workshop",
      time: "9:00 AM - 12:00 PM",
      venue: "Lisbon Tech Hub",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      isLiked: false,
    },
    {
      id: "7",
      title: "Digital Marketing Summit",
      time: "1:00 PM - 6:00 PM",
      venue: "Centro Cultural de Belém",
      imageUrl: "https://images.unsplash.com/photo-1559223607-a43c990c692c",
      isLiked: true,
    },
    {
      id: "8",
      title: "Blockchain & Crypto Meetup",
      time: "7:00 PM - 10:00 PM",
      venue: "Impact Hub Lisbon",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
      isLiked: false,
    },
  ]);

  const handleBackPress = () => {
    router.back();
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

  const HEADER_HEIGHT = verticalScale(200);
  const NAVBAR_HEIGHT = verticalScale(40);
  const HEADER_SCROLL_DISTANCE = HEADER_HEIGHT - NAVBAR_HEIGHT;
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

  // Header parallax effect - moves slower than scroll
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 3],
    extrapolate: "clamp",
  });

  // Background image opacity - fades more aggressively to prevent dark line
  const headerImageOpacity = scrollY.interpolate({
    inputRange: [-50, 0, HEADER_HEIGHT * 0.2, HEADER_HEIGHT * 0.5],
    outputRange: [0, 1, 0.3, 0],
    extrapolate: "clamp",
  });

  // Header container opacity - disappears completely when scrolled
  const headerContainerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  // Text slides up and fades
  const headerTextTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: "clamp",
  });

  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  // Scale effect for header image
  const headerImageScale = scrollY.interpolate({
    inputRange: [-100, 0, HEADER_HEIGHT],
    outputRange: [1.3, 1, 1.1],
    extrapolate: "clamp",
  });

  // Calculate section positions dynamically based on content
  // Major events section height: title (40) + each card (200) + spacing
  const MAJOR_EVENTS_CARD_HEIGHT = verticalScale(200);
  const MAJOR_EVENTS_TITLE_HEIGHT = verticalScale(40);
  const MAJOR_EVENTS_SECTION_HEIGHT =
    majorEvents.length > 0
      ? MAJOR_EVENTS_TITLE_HEIGHT +
        MAJOR_EVENTS_CARD_HEIGHT * majorEvents.length +
        verticalScale(20)
      : 0;

  const MAJOR_EVENTS_SECTION_END = HEADER_HEIGHT + MAJOR_EVENTS_SECTION_HEIGHT;
  const LOCAL_EVENTS_HEADER_POSITION =
    MAJOR_EVENTS_SECTION_END + (majorEvents.length > 0 ? verticalScale(28) : 0);

  // Calculate transition point based on number of major events
  const getTransitionOffset = () => {
    if (majorEvents.length >= 2) return verticalScale(-200);
    if (majorEvents.length === 1) return verticalScale(-120);
    return verticalScale(-20);
  };

  const titleTransitionPoint =
    LOCAL_EVENTS_HEADER_POSITION - NAVBAR_HEIGHT + getTransitionOffset();

  // Sticky header opacity for Major events - appear faster
  const majorEventsStickyOpacity =
    majorEvents.length > 0
      ? scrollY.interpolate({
          inputRange: [
            -100,
            0,
            HEADER_HEIGHT - NAVBAR_HEIGHT - 5,
            HEADER_HEIGHT - NAVBAR_HEIGHT - 2,
            titleTransitionPoint - 2,
            titleTransitionPoint,
          ],
          outputRange: [0, 0, 0, 1, 1, 0],
          extrapolate: "clamp",
        })
      : new Animated.Value(0);

  // Sticky header opacity for Local events - show immediately after Major events disappears
  const localEventsOffset = majorEvents.length > 0 ? 0 : verticalScale(30);
  const localEventsStickyOpacity = scrollY.interpolate({
    inputRange: [
      titleTransitionPoint + localEventsOffset,
      titleTransitionPoint + localEventsOffset + 2,
      LOCAL_EVENTS_HEADER_POSITION + 1000, // Keep showing for a long scroll
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

  // Icon opacity for white icons
  const whiteIconOpacity = scrollY.interpolate({
    inputRange: [
      HEADER_HEIGHT - NAVBAR_HEIGHT - 40,
      HEADER_HEIGHT - NAVBAR_HEIGHT - 10,
    ],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Icon opacity for black icons
  const blackIconOpacity = scrollY.interpolate({
    inputRange: [
      HEADER_HEIGHT - NAVBAR_HEIGHT - 40,
      HEADER_HEIGHT - NAVBAR_HEIGHT - 10,
    ],
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
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={[
            "rgba(217, 217, 217, 0.00)",
            "rgba(236, 236, 236, 0.50)",
            "#FFF",
          ]}
          locations={[0.1, 0.5089, 0.9089]}
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
            style={[styles.headerTitle, { color: colors.light_blue }]}
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
                inputRange: [
                  HEADER_HEIGHT - NAVBAR_HEIGHT - 50,
                  HEADER_HEIGHT - NAVBAR_HEIGHT - 20,
                ],
                outputRange: [0, 0.95],
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

            <View style={styles.navIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <View style={{ position: "relative" }}>
                  {/* White icon */}
                  <Animated.View
                    style={{ opacity: whiteIconOpacity, position: "absolute" }}
                  >
                    <Ionicons name="map-outline" size={25} color="white" />
                  </Animated.View>
                  {/* Black icon */}
                  <Animated.View style={{ opacity: blackIconOpacity }}>
                    <Ionicons
                      name="map-outline"
                      size={25}
                      color={colors.label_dark}
                    />
                  </Animated.View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <View style={{ position: "relative" }}>
                  {/* White icon */}
                  <Animated.View
                    style={{ opacity: whiteIconOpacity, position: "absolute" }}
                  >
                    <Ionicons name="search" size={25} color="white" />
                  </Animated.View>
                  {/* Black icon */}
                  <Animated.View style={{ opacity: blackIconOpacity }}>
                    <Ionicons
                      name="search"
                      size={25}
                      color={colors.label_dark}
                    />
                  </Animated.View>
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
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContentContainer}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={true}
      >
        {/* Header Spacer */}
        <View
          style={[styles.headerSpacer, { backgroundColor: "transparent" }]}
        />

        {/* White background content area */}
        <View style={[styles.contentArea, { backgroundColor: "#ffffff" }]}>
          {/* Major Events Section - Only render if there are events */}
          {majorEvents.length > 0 && (
            <View style={styles.section}>
              <Animated.View
                style={[
                  styles.sectionHeader,
                  { opacity: originalTitleOpacity },
                ]}
              >
                <SectionHeader
                  title="Major events"
                  showViewAll={majorEvents.length >= 2}
                  onViewAllPress={() => router.push("/worldwide-major-events")}
                  containerStyle={{ marginBottom: 0 }}
                />
              </Animated.View>

              <View style={styles.eventsGrid}>
                {majorEvents.map((event) => (
                  <MajorEventsCard
                    key={event.id}
                    event={event}
                    onPress={handleEventPress}
                    onLikePress={handleLikePress}
                    style={styles.fullWidthCard}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Local Events Section */}
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

            <View style={styles.dateHeader}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[
                  styles.dateText,
                  { color: colors.onboarding_option_dark },
                ]}
              >
                September 2
              </CustomText>
              <CustomText
                style={[styles.dateSubtext, { color: colors.event_gray }]}
              >
                | Tomorrow
              </CustomText>
            </View>

            <View style={styles.localEventsGrid}>
              {localEvents.map((event) => (
                <LocalEventCard
                  key={event.id}
                  event={event}
                  onPress={handleLocalEventPress}
                  onLikePress={handleLocalEventLike}
                />
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
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
    paddingBottom: verticalScale(20),
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
    height: verticalScale(100),
    marginRight: 0,
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
});

export default EventsScreen;
