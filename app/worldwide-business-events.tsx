import React, { useRef } from "react";
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WorldwideBusinessEventsScreenProps {}

const WorldwideBusinessEventsScreen: React.FC<
  WorldwideBusinessEventsScreenProps
> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Mock data for worldwide major events
  const [majorEvents, setMajorEvents] = React.useState<MajorEventData[]>([
    {
      id: "1",
      title: "WebSummit",
      location: "Lisbon",
      dateRange: "November 11 - 14, 2025",
      eventCount: "100+ Events",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: true,
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
        type: 'city',
        id: city.id
      },
    });
  };

  const handleCategoryPress = (category: CategoryData) => {
    console.log("Category pressed:", category);
    router.push({
      pathname: `/major-events-nearby` as any,
      params: {
        categoryName: category.name,
        type: 'category',
        id: category.id
      },
    });
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

  const HEADER_HEIGHT = verticalScale(200);
  const NAVBAR_HEIGHT = verticalScale(40);
  const HEADER_SCROLL_DISTANCE = HEADER_HEIGHT - NAVBAR_HEIGHT;
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

  // Calculate section positions dynamically
  const MAJOR_EVENTS_CARD_HEIGHT = verticalScale(100);
  const SECTION_TITLE_HEIGHT = verticalScale(40);
  const SECTION_GAP = verticalScale(20);
  const CONTENT_AREA_TOP = verticalScale(-40); // The content area starts with marginTop: -40
  const CONTENT_PADDING_TOP = verticalScale(25); // The content area has paddingTop: 25

  // Adjust for the actual content start position
  const CONTENT_START = HEADER_HEIGHT + CONTENT_AREA_TOP + CONTENT_PADDING_TOP;

  // Major events section
  const MAJOR_EVENTS_SECTION_HEIGHT =
    majorEvents.length > 0
      ? SECTION_TITLE_HEIGHT +
        MAJOR_EVENTS_CARD_HEIGHT * majorEvents.length +
        verticalScale(10)
      : 0;

  // Cities section (horizontal scroll, fixed height)
  const CITIES_SECTION_HEIGHT =
    SECTION_TITLE_HEIGHT + verticalScale(80) + verticalScale(12);

  // Local events section
  const LOCAL_EVENTS_SECTION_HEIGHT =
    localEvents.length > 0
      ? SECTION_TITLE_HEIGHT +
        verticalScale(80) * localEvents.length +
        verticalScale(20)
      : 0;

  // Calculate transition points (relative to actual scroll position)
  const CITIES_SECTION_START =
    CONTENT_START + MAJOR_EVENTS_SECTION_HEIGHT + SECTION_GAP;
  const LOCAL_EVENTS_SECTION_START =
    CITIES_SECTION_START + CITIES_SECTION_HEIGHT + SECTION_GAP;
  const CATEGORIES_SECTION_START =
    LOCAL_EVENTS_SECTION_START + LOCAL_EVENTS_SECTION_HEIGHT + SECTION_GAP;

  // Header parallax effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 3],
    extrapolate: "clamp",
  });

  // Background image opacity
  const headerImageOpacity = scrollY.interpolate({
    inputRange: [-50, 0, HEADER_HEIGHT * 0.2, HEADER_HEIGHT * 0.5],
    outputRange: [0, 1, 0.3, 0],
    extrapolate: "clamp",
  });

  // Header container opacity
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

  // Dynamic padding for navbar
  const navBarPaddingTop = scrollY.interpolate({
    inputRange: [
      HEADER_HEIGHT - NAVBAR_HEIGHT - 30,
      HEADER_HEIGHT - NAVBAR_HEIGHT - 10,
    ],
    outputRange: [verticalScale(10), verticalScale(2)],
    extrapolate: "clamp",
  });

  // Sticky header opacities for each section
  const majorEventsStickyOpacity =
    majorEvents.length > 0
      ? scrollY.interpolate({
          inputRange: [
            HEADER_HEIGHT - NAVBAR_HEIGHT - 10,
            HEADER_HEIGHT - NAVBAR_HEIGHT,
            CITIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(60),
            CITIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(50),
          ],
          outputRange: [0, 1, 1, 0],
          extrapolate: "clamp",
        })
      : new Animated.Value(0);

  const citiesStickyOpacity = scrollY.interpolate({
    inputRange: [
      CITIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(50),
      CITIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(40),
      LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - verticalScale(60),
      LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - verticalScale(50),
    ],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const localEventsStickyOpacity = scrollY.interpolate({
    inputRange: [
      LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - verticalScale(50),
      LOCAL_EVENTS_SECTION_START - NAVBAR_HEIGHT - verticalScale(40),
      CATEGORIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(60),
      CATEGORIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(50),
    ],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const categoriesStickyOpacity = scrollY.interpolate({
    inputRange: [
      CATEGORIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(50),
      CATEGORIES_SECTION_START - NAVBAR_HEIGHT - verticalScale(40),
      CATEGORIES_SECTION_START + 1000,
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
          locations={[0.1, 0.5089, 0.9089]}
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

              {/* Cities title */}
              <Animated.View
                style={[styles.absoluteTitle, { opacity: citiesStickyOpacity }]}
              >
                <CustomText
                  fontFamily="Inter-Bold"
                  style={[styles.stickyTitleText, { color: colors.label_dark }]}
                >
                  Cities
                </CustomText>
              </Animated.View>

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
                  Popular local events
                </CustomText>
              </Animated.View>

              {/* Categories title */}
              <Animated.View
                style={[
                  styles.absoluteTitle,
                  { opacity: categoriesStickyOpacity },
                ]}
              >
                <CustomText
                  fontFamily="Inter-Bold"
                  style={[styles.stickyTitleText, { color: colors.label_dark }]}
                >
                  Categories
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
        <View style={styles.headerSpacer} />

        {/* White background content area */}
        <View style={[styles.contentArea, { backgroundColor: "#ffffff" }]}>
          {/* Major Events Section */}
          <View style={styles.section}>
            <Animated.View style={{ opacity: originalMajorEventsOpacity }}>
              <SectionHeader
                title="Major events"
                showViewAll={true}
                onViewAllPress={() => router.push("/worldwide-major-events")}
                containerStyle={{ marginBottom: verticalScale(12) }}
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

          {/* Cities Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Cities"
              showViewAll={true}
              onViewAllPress={() => console.log("View all cities")}
              containerStyle={{ marginBottom: verticalScale(12) }}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              style={styles.horizontalScroll}
            >
              {cities.map((city) => (
                <CityCard key={city.id} city={city} onPress={handleCityPress} />
              ))}
            </ScrollView>
          </View>

          {/* Local Events Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Popular local events"
              showViewAll={true}
              onViewAllPress={() => console.log("View all local events")}
              containerStyle={{ marginBottom: verticalScale(12) }}
            />

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

          {/* Categories Section */}
          <View style={styles.section}>
            <SectionHeader
              title="Categories"
              showViewAll={true}
              onViewAllPress={() => console.log("View all categories")}
              containerStyle={{ marginBottom: verticalScale(12) }}
            />

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
    paddingBottom: verticalScale(20),
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
});

export default WorldwideBusinessEventsScreen;
