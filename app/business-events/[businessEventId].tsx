import React, { useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Animated,
  Platform,
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
  LocalEventCard,
  LocalEventData,
} from "@/components/Cards/LocalEventCard";
import { LinearGradient } from "expo-linear-gradient";
import BackSvg from "@/components/SvgComponents/BackSvg";
import PinBucketSvg from "@/components/SvgComponents/PinBucketSvg";
import ShareButton from "@/components/Button/ShareButton";
import SendSvgSmall from "@/components/SvgComponents/SendSvgSmall";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import FloatingMapButton from "@/components/FloatingMapButton";
import { useToast } from "@/contexts/ToastContext";
import * as Haptics from "expo-haptics";

const BusinessEventDetailsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { businessEventId } = useLocalSearchParams<{
    businessEventId: string;
  }>();

  const eventData = {
    id: businessEventId || "1",
    title: "WebSummit",
    location: "Lisbon",
    dateRange: "Sep 11-13, 2025",
    description:
      "Web Summit is the world's largest tech conference, uniting global leaders, startups, investors and media to shape technology's future.",
    imageUrl: require("@/assets/images/websummit.png"),
  };

  const [localEvents, setLocalEvents] = React.useState<LocalEventData[]>([
    {
      id: "1",
      title: "WebSummit - Day 1",
      time: "10:00 AM - 3:30 PM",
      venue: "MEO Arena",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: false,
    },
    {
      id: "2",
      title: "WebSummit - Day 2",
      time: "10:00 AM - 3:30 PM",
      venue: "MEO Arena",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      isLiked: false,
    },
    {
      id: "3",
      title: "Startup Pitch Competition",
      time: "2:00 PM - 5:00 PM",
      venue: "FIL Convention Center",
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
      isLiked: true,
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
      title: "Startup Pitch Competition",
      time: "2:00 PM - 5:00 PM",
      venue: "FIL Convention Center",
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2",
      isLiked: true,
    },
  ]);

  // Bucket functionality state
  const [isBucketBottomSheetVisible, setIsBucketBottomSheetVisible] =
    useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [
    isCreateBucketBottomSheetVisible,
    setIsCreateBucketBottomSheetVisible,
  ] = useState(false);

  // Mutation hooks for bucket functionality
  const addBucketMutation = useAddBucket();
  const createBucketMutation = useCreateBucket();
  const { showToast } = useToast();

  // State for interested button
  const [isInterested, setIsInterested] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  // Bucket functionality handlers
  const handleBucketPress = useCallback(() => {
    if (businessEventId) {
      setSelectedItemId(businessEventId);
      setIsBucketBottomSheetVisible(true);
    }
  }, [businessEventId]);

  const handleCloseBucketBottomSheet = useCallback(() => {
    setIsBucketBottomSheetVisible(false);
  }, []);

  const handleItemSelect = useCallback(
    async (item: BucketItem) => {
      if (selectedItemId) {
        try {
          await addBucketMutation.mutateAsync({
            id: item?.id,
            bucketName: item?.title,
            contentIds: [selectedItemId],
          });

          setIsBucketBottomSheetVisible(false);
          setSelectedItemId(null);
        } catch (error) {
          console.error("Failed to add item to bucket:", error);
        }
      }
    },
    [selectedItemId, addBucketMutation]
  );

  const handleShowCreateBucketBottomSheet = useCallback(() => {
    setIsBucketBottomSheetVisible(false);
    setIsCreateBucketBottomSheetVisible(true);
  }, []);

  const handleCloseCreateBucketBottomSheet = useCallback(() => {
    setIsCreateBucketBottomSheetVisible(false);
    setSelectedItemId(null);
  }, []);

  const handleCreateBucket = useCallback(
    async (bucketName: string) => {
      if (selectedItemId) {
        try {
          await createBucketMutation.mutateAsync({
            bucketName: bucketName,
            contentIds: [selectedItemId],
          });
          setIsCreateBucketBottomSheetVisible(false);
          setSelectedItemId(null);
        } catch (error) {
          console.error("Failed to create bucket:", error);
        }
      }
    },
    [selectedItemId, createBucketMutation]
  );

  const handleInterestedPress = async () => {
    // Trigger haptic feedback
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsInterested(!isInterested);

    if (!isInterested) {
      // Show toast when marking as interested
      showToast(
        "Interested! Finding you recommendations nearby.",
        "success",
        false
      );
    }
  };

  const handleMapPress = () => {
    // TODO: Navigate to map screen
    console.log("Map button pressed");
  };

  const handleLocalEventPress = (event: LocalEventData) => {
    router.push(`/event-details/${event.id}`);
  };

  const handleLocalEventLike = (event: LocalEventData) => {
    setLocalEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, isLiked: !e.isLiked } : e
      )
    );
  };

  const HEADER_HEIGHT = verticalScale(240);
  const NAVBAR_HEIGHT = verticalScale(40);
  const HEADER_SCROLL_DISTANCE = HEADER_HEIGHT - NAVBAR_HEIGHT;
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

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

  // Icon opacity for white icons - sync with navbar background
  const whiteIconOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Icon opacity for black icons - sync with navbar background
  const blackIconOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Fixed padding for navbar - no animation to prevent glitchy movement
  const navBarPaddingTop = verticalScale(6);

  // Sticky title opacity - appears very early
  const stickyTitleOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
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
          source={eventData.imageUrl}
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
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        />
        <Animated.View
          style={[
            styles.headerTextContainer,
            {
              opacity: headerTextOpacity,
              transform: [{ translateY: headerTextTranslateY }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.Image
              source={require("@/assets/images/websummit-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.eventSubtitle, { color: colors.label_dark }]}
          >
            Events happening during
          </CustomText>
        </Animated.View>

        {/* Large Title */}
        <Animated.View
          style={[
            styles.largeTitleContainer,
            {
              opacity: headerTextOpacity,
              transform: [{ translateY: headerTextTranslateY }],
            },
          ]}
        >
          <CustomText
            fontFamily="Inter-Bold"
            style={[styles.largeTitle, { color: colors.light_blue }]}
          >
            {eventData.title}
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
                inputRange: [0, 15, 40],
                outputRange: [0, 0.7, 0.95],
                extrapolate: "clamp",
              }),
              backgroundColor: "#fff",
              height: NAVBAR_BACKGROUND_HEIGHT,
            },
          ]}
        />

        <SafeAreaView style={styles.navContainer}>
          <View style={[styles.navBar, { paddingTop: navBarPaddingTop }]}>
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
                {/* White icon for black navbar */}
                <Animated.View style={{ opacity: blackIconOpacity }}>
                  <BackSvg stroke="#000" />
                </Animated.View>
              </View>
            </TouchableOpacity>

            {/* Sticky Title */}
            <View style={styles.stickyTitleContainer} pointerEvents="none">
              <Animated.View
                style={[styles.stickyTitle, { opacity: stickyTitleOpacity }]}
              >
                <CustomText
                  fontFamily="Inter-Bold"
                  style={[styles.stickyTitleText, { color: colors.label_dark }]}
                >
                  {eventData.title}
                </CustomText>
              </Animated.View>
            </View>

            <View style={styles.navIcons}>
              {/* White versions */}
              <Animated.View
                style={[
                  styles.buttonsRow,
                  { opacity: whiteIconOpacity, position: "absolute", right: 0 },
                ]}
              >
                <CustomTouchable
                  style={styles.bucketButton}
                  bgColor={colors.lime}
                  onPress={handleBucketPress}
                >
                  <PinBucketSvg />
                </CustomTouchable>
                <CustomTouchable
                  bgColor={colors.lime}
                  style={styles.shareButton}
                >
                  <ShareButton
                    title={eventData.title}
                    message={`Check out ${eventData.title} in ${eventData.location} happening ${eventData.dateRange}`}
                    url=""
                    IconComponent={() => (
                      <SendSvgSmall width={18} height={18} stroke="#000" />
                    )}
                  />
                </CustomTouchable>
              </Animated.View>

              {/* Dark versions */}
              <Animated.View
                style={[styles.buttonsRow, { opacity: blackIconOpacity }]}
              >
                <CustomTouchable
                  style={styles.bucketButton}
                  bgColor={colors.lime}
                  onPress={handleBucketPress}
                >
                  <PinBucketSvg />
                </CustomTouchable>
                <CustomTouchable
                  bgColor={colors.lime}
                  style={styles.shareButton}
                >
                  <ShareButton
                    title={eventData.title}
                    message={`Check out ${eventData.title} in ${eventData.location} happening ${eventData.dateRange}`}
                    url=""
                    IconComponent={() => (
                      <SendSvgSmall width={18} height={18} stroke="#000" />
                    )}
                  />
                </CustomTouchable>
              </Animated.View>
            </View>
          </View>
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

        {/* Content Area */}
        <View style={styles.contentArea}>
          <View style={styles.section}>
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.event_gray}
                />
                <CustomText
                  style={[styles.metaText, { color: colors.label_dark }]}
                >
                  {eventData.location}
                </CustomText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.event_gray}
                />
                <CustomText
                  style={[styles.metaText, { color: colors.label_dark }]}
                >
                  {eventData.dateRange}
                </CustomText>
              </View>
            </View>

            <CustomText
              style={[
                styles.description,
                { color: colors.onboarding_option_dark },
              ]}
            >
              {eventData.description}
            </CustomText>

            <TouchableOpacity
              style={[
                styles.interestedButton,
                { backgroundColor: colors.lime },
              ]}
              onPress={handleInterestedPress}
            >
              <Ionicons
                name={isInterested ? "heart" : "heart-outline"}
                size={18}
                color="#000"
              />
              <CustomText fontFamily="Inter-SemiBold" style={styles.buttonText}>
                {isInterested ? "Interested" : "Interested"}
              </CustomText>
            </TouchableOpacity>

            {/* Horizontal divider line */}
            <View style={styles.dividerLine} />

            <CustomText
              fontFamily="Inter-Bold"
              style={[styles.sectionTitle, { color: colors.label_dark }]}
            >
              What's happening near you
            </CustomText>

            <View style={styles.dateHeader}>
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.dateText, { color: colors.label_dark }]}
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
                  hasTabBar={false}
                />
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Map Button */}
      <FloatingMapButton onPress={handleMapPress} hasTabBar={false} />

      {/* Bucket Bottom Sheets */}
      <BucketBottomSheet
        isVisible={isBucketBottomSheetVisible}
        onClose={handleCloseBucketBottomSheet}
        onItemSelect={handleItemSelect}
        onCreateNew={handleShowCreateBucketBottomSheet}
        selectedLikeItemId={selectedItemId}
      />
      <CreateBucketBottomSheet
        isVisible={isCreateBucketBottomSheetVisible}
        onClose={handleCloseCreateBucketBottomSheet}
        onCreateBucket={handleCreateBucket}
      />
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
    height: verticalScale(240),
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
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  largeTitleContainer: {
    position: "absolute",
    bottom: verticalScale(10),
    left: horizontalScale(24),
  },
  largeTitle: {
    fontSize: scaleFontSize(42),
  },
  headerTextContainer: {
    position: "absolute",
    bottom: verticalScale(55),
    left: horizontalScale(24),
    zIndex: 5,
  },
  logoContainer: {
    marginBottom: verticalScale(15),
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  eventSubtitle: {
    fontSize: scaleFontSize(16),
  },
  navContainer: {
    backgroundColor: "transparent",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(8),
  },
  backButton: {},
  navIcons: {
    position: "relative",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  bucketButton: {
    width: 30,
    height: 30,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 30,
    height: 30,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  stickyTitleContainer: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
  },
  stickyTitle: {
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
    paddingBottom: verticalScale(110),
  },
  headerSpacer: {
    height: verticalScale(220),
  },
  contentArea: {
    backgroundColor: "#fff",
    minHeight: "100%",
  },
  section: {
    paddingHorizontal: horizontalScale(24),
    marginTop: verticalScale(20),
  },
  eventMeta: {
    flexDirection: "row",
    gap: horizontalScale(15),
    marginBottom: verticalScale(6),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(6),
  },
  metaText: {
    fontSize: scaleFontSize(16),
  },
  description: {
    fontSize: scaleFontSize(14),
    lineHeight: scaleFontSize(20),
    marginBottom: verticalScale(12),
  },
  interestedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: horizontalScale(8),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(5),
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  buttonText: {
    fontSize: scaleFontSize(14),
    color: "#000",
  },
  dividerLine: {
    height: 0.5,
    backgroundColor: "#E5E5E6",
    marginVertical: verticalScale(20),
    marginHorizontal: 0, // Keep within section padding
  },
  sectionTitle: {
    fontSize: scaleFontSize(20),
    marginBottom: verticalScale(15),
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
    fontSize: scaleFontSize(12),
  },
  localEventsGrid: {
    gap: verticalScale(10),
  },
});

export default BusinessEventDetailsScreen;
