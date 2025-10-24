import React, { useRef, useState, useCallback, useEffect } from "react";
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
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
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
import OptimizedImage, {
  OptimizedImageBackground,
} from "@/components/OptimizedImage/OptimizedImage";
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
import { useBusinessEventById } from "@/hooks/useBusinessEvents";
import { formatBusinessEventDateRange } from "@/utilities/eventHelpers";
import { useAddLike } from "@/hooks/useLikes";
import { useQueryClient } from "@tanstack/react-query";
import LocationPinSvg from "@/components/SvgComponents/LocationPinSvg";
import CalendarSvg from "@/components/SvgComponents/CalendarSvg";
import { ErrorScreen } from "@/components/ErrorScreen/ErrorScreen";

// Helper function to format event time
const formatEventTime = (startDate?: string, endDate?: string) => {
  if (!startDate) return "TBD";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (end) {
    // If it's the same day, show time range
    if (start.toDateString() === end.toDateString()) {
      return `${formatTime(start)} - ${formatTime(end)}`;
    }
    // If it spans multiple days but we still want to show a time range for the event,
    // show the start and end times (this is common for recurring events)
    else {
      return `${formatTime(start)} - ${formatTime(end)}`;
    }
  }

  return formatTime(start);
};

// Helper function to format date label with separate parts
const formatDateLabel = (date: Date) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}`;

  let relativeDay = "";
  if (date.toDateString() === today.toDateString()) {
    relativeDay = "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    relativeDay = "Tomorrow";
  } else {
    relativeDay = dayNames[date.getDay()];
  }

  return {
    date: dateStr,
    relative: relativeDay,
  };
};

const BusinessEventDetailsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { businessEventId } = useLocalSearchParams<{
    businessEventId: string;
  }>();

  // Fetch real business event data (businessEventId is actually the contentId)
  const {
    data: eventData,
    isLoading,
    error,
  } = useBusinessEventById(businessEventId || "");

  // Transform side events from API to LocalEventData format
  const sideEvents = React.useMemo(() => {
    if (!eventData?.sideEvents) return [];

    return eventData.sideEvents.map((sideEvent) => ({
      id: sideEvent.id || sideEvent.contentId || '',
      title: sideEvent.title || sideEvent.name || '',
      time: formatEventTime(
        sideEvent.eventDatetimeStart || undefined,
        sideEvent.eventDatetimeEnd || undefined
      ),
      venue: sideEvent.addressShort || sideEvent.addressLong || "",
      imageUrl: sideEvent.internalImageUrls?.[0] || "",
      isLiked: sideEvent.userLiked || false,
    }));
  }, [eventData?.sideEvents]);

  // Group side events by date
  const groupedSideEvents = React.useMemo(() => {
    const groups: {
      [key: string]: {
        date: string;
        dateLabel: { date: string; relative: string };
        events: LocalEventData[];
      };
    } = {};

    sideEvents.forEach((event) => {
      // Find the original side event to get the start date
      const originalEvent = eventData?.sideEvents?.find(
        (e) => (e.id || e.contentId) === event.id
      );
      if (!originalEvent?.eventDatetimeStart) return;

      const eventDate = new Date(originalEvent.eventDatetimeStart);
      const dateKey = eventDate.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          dateLabel: formatDateLabel(eventDate),
          events: [],
        };
      }

      groups[dateKey].events.push(event);
    });

    // Sort groups by date and return as array
    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [sideEvents, eventData?.sideEvents]);

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

  // Mutation hook for likes
  const addLikeMutation = useAddLike();

  // Initialize interested state from API userLiked
  const [isInterested, setIsInterested] = useState(false);

  // Sync isInterested with API userLiked when eventData changes
  useEffect(() => {
    if (eventData?.userLiked !== undefined) {
      setIsInterested(eventData.userLiked);
    }
  }, [eventData?.userLiked]);

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

    const likeData = {
      contentIds: [businessEventId || ""],
    };

    // Optimistic update - immediately toggle the interested state
    setIsInterested(!isInterested);

    addLikeMutation.mutate(likeData, {
      onSuccess: () => {
        // Cache invalidation handled automatically by useAddLike hook

        if (!isInterested) {
          showToast(
            "Interested! Finding you recommendations nearby.",
            "success",
            false
          );
        }
      },
      onError: (error) => {
        console.error("Failed to add like:", error);
        // Revert optimistic update on error
        setIsInterested(!isInterested);
        showToast("Failed to mark as interested", "error");
      },
    });
  };

  const handleMapPress = () => {
    // Navigate to map screen with business events for this specific event
    router.push(`/map-screen?source=business&type=details&eventId=${businessEventId}`);
  };

  const handleLocalEventPress = (event: LocalEventData) => {
    // Navigate to side event details using the event details route
    router.push(`/event-details/${event.id}`);
  };

  const handleLocalEventLike = (event: LocalEventData) => {
    const likeData = {
      contentIds: [event.id],
    };

    // Make API call to like/unlike the side event
    addLikeMutation.mutate(likeData, {
      onSuccess: () => {
        // Cache invalidation handled automatically by useAddLike hook
      },
      onError: (error) => {
        console.error("Failed to like side event:", error);
        showToast("Failed to save your interest", "error");
      },
    });
  };

  // Scroll handlers for snap-to behavior
  const handleScrollBeginDrag = useCallback(() => {
    // Can be used for future scroll state tracking if needed
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // Add listener to get current scroll value and handle snap
    const listener = scrollY.addListener(({ value }) => {
      // Aggressive snap like ask-kevin to prevent intermediate states
      const snapThreshold = 40; // Matches our header animation range

      if (value > 0 && value < snapThreshold) {
        // Snap to hidden or visible based on scroll position
        const targetValue = value > 20 ? snapThreshold : 0; // Snap at 20px midpoint
        Animated.spring(scrollY, {
          toValue: targetValue,
          useNativeDriver: false,
          tension: 150, // Responsive
          friction: 10,
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

  // Show loading or handle no data
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <AnimatedLoader />
      </View>
    );
  }

  // Show error state for API failures
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Fixed Navigation Bar for Error State */}
        <View style={styles.fixedNavBar}>
          <View
            style={[
              styles.navBarBackground,
              { backgroundColor: "#fff", opacity: 1 },
            ]}
          />
          <SafeAreaView style={styles.navContainer}>
            <View style={[styles.navBar, { paddingTop: verticalScale(6) }]}>
              <TouchableOpacity
                onPress={handleBackPress}
                style={styles.backButton}
              >
                <BackSvg stroke="#000" width={17} height={27} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.errorContentContainer}>
          <ErrorScreen
            title="Failed to load business event"
            message="Please check your connection and try again"
            buttonText="Go Back"
            onRetry={handleBackPress}
          />
        </View>
      </View>
    );
  }

  if (!eventData) {
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        {/* Fixed Navigation Bar for Error State */}
        <View style={styles.fixedNavBar}>
          <View
            style={[
              styles.navBarBackground,
              { backgroundColor: "#fff", opacity: 1 },
            ]}
          />
          <SafeAreaView style={styles.navContainer}>
            <View style={[styles.navBar, { paddingTop: verticalScale(6) }]}>
              <TouchableOpacity
                onPress={handleBackPress}
                style={styles.backButton}
              >
                <BackSvg stroke="#000" width={17} height={27} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.errorContentContainer}>
          <ErrorScreen
            title="Business event not found"
            message="This event may have been removed or doesn't exist"
            buttonText="Go Back"
            onRetry={handleBackPress}
          />
        </View>
      </View>
    );
  }

  const HEADER_HEIGHT = verticalScale(240);
  const NAVBAR_HEIGHT = verticalScale(40);
  const NAVBAR_BACKGROUND_HEIGHT = insets.top + NAVBAR_HEIGHT;

  // Header parallax effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 3],
    extrapolate: "clamp",
  });

  // Background image opacity - immediate fade like ask-kevin
  const headerImageOpacity = scrollY.interpolate({
    inputRange: [-50, 0, 20, 40],
    outputRange: [0, 1, 0.2, 0],
    extrapolate: "clamp",
  });

  // Header container opacity - immediate fade like ask-kevin
  const headerContainerOpacity = scrollY.interpolate({
    inputRange: [0, 20, 40],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  // Text slides up and fades - immediate like ask-kevin
  const headerTextTranslateY = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  const headerTextOpacity = scrollY.interpolate({
    inputRange: [0, 20, 40],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  // Scale effect for header image
  const headerImageScale = scrollY.interpolate({
    inputRange: [-100, 0, HEADER_HEIGHT],
    outputRange: [1.3, 1, 1.1],
    extrapolate: "clamp",
  });

  // Icon opacity for white icons - immediate transition like ask-kevin
  const whiteIconOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Icon opacity for black icons - immediate transition like ask-kevin
  const blackIconOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Fixed padding for navbar - no animation to prevent glitchy movement
  const navBarPaddingTop = verticalScale(6);

  // Sticky title opacity - appears immediately when scrolling starts
  const stickyTitleOpacity = scrollY.interpolate({
    inputRange: [0, 10],
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
            height: verticalScale(264) + +insets.top,
          },
        ]}
        pointerEvents="none"
      >
        {/* Background Image with scale effect */}
        <Animated.View
          style={[
            styles.headerBackground,
            {
              opacity: headerImageOpacity,
              transform: [{ scale: headerImageScale }],
              height: verticalScale(250) + +insets.top,
            },
          ]}
        >
          <OptimizedImageBackground
            source={
              eventData.image
                ? {
                    uri: eventData.image.startsWith("http")
                      ? eventData.image
                      : `https://wik-general-api-beta-408585232460.europe-west4.run.app/uploads/${eventData.image}`,
                  }
                : ""
            }
            style={{ height: verticalScale(250) + insets.top }}
            contentFit="cover"
            showLoadingIndicator={true}
            showErrorFallback={true}
          />
        </Animated.View>

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
          {eventData.logoImage && (
            <View style={styles.logoContainer}>
              <OptimizedImage
                source={{
                  uri: eventData.logoImage.startsWith("http")
                    ? eventData.logoImage
                    : `https://wik-general-api-beta-408585232460.europe-west4.run.app/uploads/${eventData.logoImage}`,
                }}
                style={styles.logoImage}
                contentFit="cover"
                showLoadingIndicator={true}
                showErrorFallback={true}
              />
            </View>
          )}

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
            style={[styles.largeTitle, { color: colors.label_dark }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {eventData.eventTitle || eventData.name}
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
                inputRange: [0, 15, 30],
                outputRange: [0, 0.8, 0.98],
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
                  <BackSvg width={17} height={27} />
                </Animated.View>
                {/* White icon for black navbar */}
                <Animated.View style={{ opacity: blackIconOpacity }}>
                  <BackSvg stroke="#000" width={17} height={27} />
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
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {eventData.eventTitle || eventData.name}
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
                    title={eventData.eventTitle || eventData.name}
                    message={`Check out ${
                      eventData.eventTitle || eventData.name
                    } happening on ${
                      eventData.eventDatetimeStart
                        ? new Date(
                            eventData.eventDatetimeStart
                          ).toLocaleDateString()
                        : "TBD"
                    }`}
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
                    title={eventData.eventTitle || eventData.name}
                    message={`Check out ${
                      eventData.eventTitle || eventData.name
                    } happening on ${
                      eventData.eventDatetimeStart
                        ? new Date(
                            eventData.eventDatetimeStart
                          ).toLocaleDateString()
                        : "TBD"
                    }`}
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
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContentContainer}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={true}
      >
        {/* Header Spacer */}
        <View
          style={[
            styles.headerSpacer,
            { height: verticalScale(220) + insets.top },
          ]}
        />

        {/* Content Area */}
        <View style={styles.contentArea}>
          <View style={styles.section}>
            <View style={styles.eventMeta}>
              {/* Location */}
              {eventData.addressShort && (
                <View style={styles.metaItem}>
                  <LocationPinSvg fill="#A3A3A8" />
                  <CustomText
                    style={[styles.metaText, { color: colors.label_dark }]}
                  >
                    {eventData.addressShort}
                  </CustomText>
                </View>
              )}

              {/* Date */}
              <View style={styles.metaItem}>
                <CalendarSvg />
                <CustomText
                  style={[
                    styles.metaText,
                    { color: colors.label_dark, flex: 1 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatBusinessEventDateRange(eventData, {
                    includeWeekday: false,
                    includeYear: true,
                  })}
                </CustomText>
              </View>
            </View>

            {eventData.description && (
              <CustomText
                style={[
                  styles.description,
                  { color: colors.onboarding_option_dark },
                ]}
              >
                {eventData.description}
              </CustomText>
            )}

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

            {groupedSideEvents.length > 0 && (
              <>
                <CustomText
                  fontFamily="Inter-Bold"
                  style={[styles.sectionTitle, { color: colors.label_dark }]}
                >
                  What's happening near you
                </CustomText>

                {groupedSideEvents.map((group) => (
                  <View key={group.date}>
                    <View style={styles.dateHeader}>
                      <CustomText
                        fontFamily="Inter-SemiBold"
                        style={[styles.dateText, { color: "#4A4A4F" }]}
                      >
                        {group.dateLabel.date}
                      </CustomText>
                      <CustomText
                        fontFamily="Inter-Regular"
                        style={[styles.relativeDayText, { color: "#A3A3A8" }]}
                      >
                        | {group.dateLabel.relative}
                      </CustomText>
                    </View>

                    <View style={styles.localEventsGrid}>
                      {group.events.map((event) => (
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
              </>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Map Button - Only show if there are side events available */}
      {sideEvents.length > 0 && (
        <FloatingMapButton onPress={handleMapPress} hasTabBar={false} />
      )}

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
  },
  errorContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    marginTop: verticalScale(60), // Account for the fixed nav bar
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(264), // Container height as specified
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
    height: verticalScale(250), // Fixed height as specified
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
    right: horizontalScale(24),
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
    width: 70,
    height: 70,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: "hidden", // Ensure border radius is visible
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
    width: 35,
    height: 35,
    borderRadius: 23.375,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 35,
    height: 35,
    borderRadius: 23.375,
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
    right: horizontalScale(16),
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
    flexDirection: "column",
    gap: horizontalScale(6),
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
  relativeDayText: {
    fontSize: scaleFontSize(16),
  },
  localEventsGrid: {
    gap: verticalScale(10),
  },
});

export default BusinessEventDetailsScreen;
