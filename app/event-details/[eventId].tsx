import React, { useRef, useMemo, useCallback, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  StatusBar,
  View,
  Linking,
  FlatList,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import BackHeader from "@/components/Header/BackHeader";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomView from "@/components/CustomView";
import { useContentById } from "@/hooks/useContent";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import { ErrorScreen } from "@/components/ErrorScreen";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import CategoryTag from "@/components/Tag/CategoryTag";
import OptimizedImage from "@/components/OptimizedImage/OptimizedImage";
import { useAddLike } from "@/hooks/useLikes";
import { useAddDislike } from "@/hooks/useDislikes";
import { useQueryClient } from "@tanstack/react-query";
import RatingStarSvg from "@/components/SvgComponents/RatingStarSvg";
import MapView, { Marker } from "react-native-maps";
import { formatSimilarity } from "@/utilities/formatSimilarity";
import { formatDistance } from "@/utilities/formatDistance";
import { shouldShowValidDistance } from "@/utilities/distanceHelpers";
import { trimString, trimOrNull } from "@/utilities/stringHelpers";

// Using SVG placeholder via OptimizedImage error handling

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

interface EventDetailsScreenProps {}

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = () => {
  const { colors } = useTheme();
  const { userLocation } = useUserLocation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Get the event ID from params
  const eventId = params.eventId as string;

  // Fetch content data using the eventId
  const { data: contentData, isLoading, error } = useContentById(eventId);
  const addLikeMutation = useAddLike();
  const addDislikeMutation = useAddDislike();
  const queryClient = useQueryClient();
  const authData = queryClient.getQueryData<{ accessToken?: string }>(["auth"]);
  const jwt = authData?.accessToken || null;

  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCarouselRef = useRef<FlatList>(null);

  // Calculate dynamic heights based on your header
  const ESTIMATED_HEADER_HEIGHT = verticalScale(10) + 12 + verticalScale(36);
  const PANEL_MID_HEIGHT = SCREEN_HEIGHT * 0.5;
  const PANEL_MAX_HEIGHT = SCREEN_HEIGHT - insets.top - ESTIMATED_HEADER_HEIGHT;

  // Calculate the image container height to stop at the first snap point
  const IMAGE_CONTAINER_HEIGHT =
    SCREEN_HEIGHT - PANEL_MID_HEIGHT + verticalScale(24);

  // Bottom sheet setup with dynamic snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => {
    const midHeightPercentage = (PANEL_MID_HEIGHT / SCREEN_HEIGHT) * 100;
    const maxHeightPercentage = (PANEL_MAX_HEIGHT / SCREEN_HEIGHT) * 100;
    return [
      `${midHeightPercentage.toFixed(1)}%`,
      `${maxHeightPercentage.toFixed(1)}%`,
    ];
  }, [PANEL_MID_HEIGHT, PANEL_MAX_HEIGHT]);

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

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    // Optional: Add any logic when sheet changes
  }, []);

  // Fixed handleLikePress function with correct query key
  const handleLikePress = useCallback(() => {
    if (!contentData || contentData.userDisliked) return;

    const likeData = {
      contentIds: [eventId],
    };

    addLikeMutation.mutate(likeData, {
      onSuccess: () => {
        // Update the correct query key that matches useContentById
        queryClient.setQueryData(
          ["content", "byId", eventId], // ✅ This matches your hook's query key
          (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                userLiked: !oldData.userLiked,
              };
            }
            return oldData;
          }
        );

        // Invalidate the list queries to force fresh data
        queryClient.invalidateQueries({ queryKey: ["content", "basic"] });
      },
      onError: (error) => {
        console.error("Failed to add like:", error);
      },
    });
  }, [contentData, eventId, addLikeMutation, queryClient]);

  // Fixed handleDislikePress function with correct query key
  const handleDislikePress = useCallback(() => {
    if (!contentData || contentData.userDisliked) return;

    const dislikeData = {
      contentIds: [eventId],
    };

    addDislikeMutation.mutate(dislikeData, {
      onSuccess: () => {
        // Update the correct query key that matches useContentById
        queryClient.setQueryData(
          ["content", "byId", eventId], // ✅ This matches your hook's query key
          (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                userDisliked: true,
                userLiked: false, // Remove like when disliking
              };
            }
            return oldData;
          }
        );

        // Invalidate the list queries to force fresh data
        queryClient
          .invalidateQueries({ queryKey: ["content", "basic"] })
          .then(() => router.back());
      },
      onError: (error) => {
        console.error("Failed to add dislike:", error);
      },
    });
  }, [contentData, eventId, addDislikeMutation, queryClient, router]);
  // Handle three dots button press
  const handleMoreOptionsPress = () => {
    if (contentData?.websiteUrl) {
      Linking.openURL(contentData.websiteUrl).catch((err) => {
        console.error("Failed to open URL:", err);
      });
    } else {
      // console.log("No website URL available for this item");
    }
  };

  // Get images array with fallback
  const getImages = () => {
    if (
      contentData?.internalImageUrls &&
      Array.isArray(contentData.internalImageUrls) &&
      contentData.internalImageUrls.length > 0
    ) {
      return contentData.internalImageUrls;
    }
    // Return a broken image URL to trigger the error handler and show SVG placeholder
    return ["https://example.com/nonexistent-image.jpg"];
  };

  const images = useMemo(() => getImages(), [contentData]);

  // Handle image scroll
  const onImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  // Render image item
  const renderImageItem = ({ item }: { item: string }) => {
    return (
      <OptimizedImage
        source={typeof item === "string" ? { uri: item } : item}
        style={[styles.backgroundImage, { height: IMAGE_CONTAINER_HEIGHT }]}
        contentFit="cover"
        priority="high"
        showLoadingIndicator={true}
        showErrorFallback={true}
      />
    );
  };

  // Bucket functionality handlers
  const handleShowBucketBottomSheet = () => {
    if (eventId) {
      setSelectedItemId(eventId);
      setIsBucketBottomSheetVisible(true);
    }
  };

  const handleCloseBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
  };

  const handleItemSelect = async (item: BucketItem) => {
    if (selectedItemId) {
      try {
        await addBucketMutation.mutateAsync({
          id: item?.id,
          bucketName: item?.title,
          contentIds: [selectedItemId],
        });

        setIsBucketBottomSheetVisible(false);
        setSelectedItemId(null);

        // console.log(`Successfully added item to bucket "${item.title}"`);
      } catch (error) {
        // console.error("Failed to add item to bucket:", error);
      }
    }
  };

  const handleShowCreateBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
    setIsCreateBucketBottomSheetVisible(true);
  };

  const handleCloseCreateBucketBottomSheet = () => {
    setIsCreateBucketBottomSheetVisible(false);
    setSelectedItemId(null);
  };

  const handleCreateBucket = async (bucketName: string) => {
    if (selectedItemId) {
      try {
        await createBucketMutation.mutateAsync({
          bucketName: bucketName,
          contentIds: [selectedItemId],
        });
        setIsCreateBucketBottomSheetVisible(false);
        setSelectedItemId(null);
        // console.log(`Successfully created bucket "${bucketName}"`);
      } catch (error) {
        // console.error("Failed to create bucket:", error);
      }
    }
  };

  // Helper function to format price
  const formatPrice = (price: number | string | null) => {
    if (price === null || price === undefined) return "Price on request";
    if (typeof price === "string") return price; // Already formatted
    return `€${price}`;
  };

  // Helper function to extract coordinates from Google Maps URL
  const extractCoordinatesFromUrl = (url: string) => {
    const coordsMatch = url.match(/query=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
      return {
        latitude: parseFloat(coordsMatch[1]),
        longitude: parseFloat(coordsMatch[2]),
      };
    }
    // Fallback - return Lisbon coordinates if extraction fails
    return {
      latitude: 38.7223,
      longitude: -9.1393,
    };
  };

  const openOnMap = async () => {
    if (!contentData?.googleMapsUrl) {
      console.log("No Google Maps URL available for this item");
      return;
    }

    console.log("Original URL:", contentData.googleMapsUrl);

    // Extract coordinates from the URL
    const coordsMatch = contentData.googleMapsUrl.match(
      /query=(-?\d+\.?\d*),(-?\d+\.?\d*)/
    );

    if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
      const lat = coordsMatch[1];
      const lng = coordsMatch[2];
      console.log("Extracted coordinates:", lat, lng);

      if (Platform.OS === "ios") {
        // For iOS, try Apple Maps first with location name - prefer title (venue name)
        const locationName =
          trimString(contentData.title) ||
          trimString(contentData.addressShort) ||
          trimString(contentData.address) ||
          "Location";

        const encodedLocationName = encodeURIComponent(locationName);
        const appleMapsUrls = [
          `maps://?q=${encodedLocationName}&ll=${lat},${lng}`,
          `http://maps.apple.com/?q=${encodedLocationName}&ll=${lat},${lng}`,
        ];

        for (const url of appleMapsUrls) {
          try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
              await Linking.openURL(url);
              console.log("Successfully opened Apple Maps");
              return;
            }
          } catch (error) {
            console.log("Apple Maps failed:", error);
          }
        }

        // Fallback to Google Maps
        try {
          const googleUrl = `https://maps.google.com/?q=${encodedLocationName}&ll=${lat},${lng}`;
          await Linking.openURL(googleUrl);
          console.log("Opened Google Maps web fallback");
        } catch (error) {
          console.error("All map options failed:", error);
        }
      } else {
        // For Android, use geo intent with location name - prefer title (venue name)
        const locationName =
          trimString(contentData.title) ||
          trimString(contentData.addressShort) ||
          trimString(contentData.address) ||
          "Location";

        const encodedLocationName = encodeURIComponent(locationName);
        const androidUrls = [
          `geo:${lat},${lng}?q=${lat},${lng}(${locationName})`,
          `https://maps.google.com/?q=${encodedLocationName}&ll=${lat},${lng}`,
          `geo:0,0?q=${lat},${lng}(${locationName})`,
        ];

        for (const url of androidUrls) {
          try {
            await Linking.openURL(url);
            console.log("Successfully opened maps on Android:", url);
            return;
          } catch (error) {
            console.log("Android map URL failed:", url, error);
          }
        }
      }
    } else {
      // If coordinate extraction fails, try the original URL
      console.log("Could not extract coordinates, trying original URL");
      try {
        await Linking.openURL(contentData.googleMapsUrl);
      } catch (error) {
        console.error("Failed to open original URL:", error);
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return <AnimatedLoader />;
  }

  // Show error state
  if (error) {
    return (
      <CustomView style={styles.container}>
        <View style={styles.errorContainer}>
          <ErrorScreen
            title="Failed to load event details"
            message="Please check your connection and try again"
            buttonText="Go Back"
            onRetry={() => router.back()}
          />
        </View>
      </CustomView>
    );
  }

  // Show not found state
  if (!contentData) {
    return (
      <CustomView style={styles.container}>
        <View style={styles.errorContainer}>
          <ErrorScreen
            title="Event not found"
            message="This event may have been removed or doesn't exist"
            buttonText="Go Back"
            onRetry={() => router.back()}
          />
        </View>
      </CustomView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />

        {/* Image Carousel - Now with fixed height */}
        <View
          style={[styles.imageContainer, { height: IMAGE_CONTAINER_HEIGHT }]}
        >
          <FlatList
            ref={imageCarouselRef}
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `image-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onImageScroll}
            style={styles.imageCarousel}
            // KEY ANDROID OPTIMIZATIONS:
            initialNumToRender={Math.min(images.length, 3)} // Start with 3 images
            maxToRenderPerBatch={Math.min(images.length, 5)} // Batch render up to 5
            windowSize={Math.max(1, images.length <= 5 ? images.length : 5)} // Dynamic window size, minimum 1
            removeClippedSubviews={false} // Keep images rendered for smooth scrolling
            // Helps FlatList calculate positions efficiently
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />

          {/* Back Header - Always visible overlay */}
          <SafeAreaView
            style={[
              styles.backHeaderOverlay,
              { backgroundColor: colors.overlay },
            ]}
          >
            <BackHeader transparent={true} />
          </SafeAreaView>

          {/* Image Indicators - Now positioned relative to image container */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor:
                        index === currentImageIndex
                          ? colors.text_white
                          : "rgba(255, 255, 255, 0.5)",
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backgroundStyle={{ backgroundColor: colors.background }}
          handleIndicatorStyle={{
            backgroundColor: "#F2F2F7",
            width: 40,
            height: 4,
          }}
          enablePanDownToClose={false}
          enableOverDrag={false}
          enableDynamicSizing={false}
          animateOnMount={true}
          style={styles.bottomSheetShadow}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Panel Content */}
            <CustomView style={styles.panelContent}>
              {/* EVENT Badge */}
              <CustomView style={styles.badgeContainer}>
                <CategoryTag category={contentData.category} colors={colors} />

                {/* Action Buttons */}
                {/* <CustomView style={styles.row}>
                  {!hideBucketsButton && (
                    <CustomTouchable
                      style={styles.bucketContainer}
                      bgColor={colors.label_dark}
                      onPress={handleShowBucketBottomSheet}
                    >
                      <BucketSvg />
                    </CustomTouchable>
                  )}
                  <CustomTouchable
                    bgColor={colors.onboarding_gray}
                    style={styles.shareButton}
                  >
                    <ShareButton
                      width={14}
                      height={14}
                      title={contentData.title}
                      message={`Check out this ${contentData.category}: ${contentData.title}`}
                      url={contentData.contentShareUrl}
                    />
                  </CustomTouchable>
                </CustomView> */}
              </CustomView>

              {/* Title Section */}
              <CustomView style={styles.titleSection}>
                <CustomTouchable onPress={handleMoreOptionsPress}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.title, { color: colors.label_dark }]}
                  >
                    {trimString(contentData.title) || "Unknown"}
                  </CustomText>
                </CustomTouchable>

                {/* Similarity Display */}
                {/* {contentData?.similarity != null &&
                  typeof contentData.similarity === "number" && (
                    <View style={styles.matchContainer}>
                      <CustomText
                        fontFamily="Inter-SemiBold"
                        style={[
                          styles.similarityText,
                          { color: colors.event_gray },
                        ]}
                      >
                        {formatSimilarity(contentData.similarity)}
                      </CustomText>
                      <CustomText
                        fontFamily="Inter-SemiBold"
                        style={[styles.matchText, { color: colors.event_gray }]}
                      >
                        match
                      </CustomText>
                    </View>
                  )} */}

                {/* Rating, Price, Distance Display - Match Swipe Cards */}
                <View style={styles.infoRow}>
                  {contentData?.rating && (
                    <View style={styles.ratingContainer}>
                      <RatingStarSvg stroke="#4A4A4F" fill="#4A4A4F" />
                      <CustomText
                        fontFamily="Inter-Medium"
                        style={[styles.infoText, { color: "#4A4A4F" }]}
                      >
                        {contentData.rating}
                      </CustomText>
                    </View>
                  )}

                  {contentData?.rating &&
                    (shouldShowValidDistance(contentData?.distance, userLocation) || contentData?.price) && (
                      <View style={styles.dotSeparator}>
                        <View
                          style={[styles.dot, { backgroundColor: "#4A4A4F" }]}
                        />
                      </View>
                    )}

                  {shouldShowValidDistance(contentData?.distance, userLocation) && (
                      <CustomText
                        fontFamily="Inter-Medium"
                        style={[styles.infoText, { color: "#4A4A4F" }]}
                      >
                        {formatDistance(contentData.distance!)}
                      </CustomText>
                    )}

                  {shouldShowValidDistance(contentData?.distance, userLocation) &&
                    contentData?.price != null && (
                      <View style={styles.dotSeparator}>
                        <View
                          style={[styles.dot, { backgroundColor: "#4A4A4F" }]}
                        />
                      </View>
                    )}

                  {contentData?.price != null && (
                    <CustomText
                      fontFamily="Inter-Medium"
                      style={[styles.infoText, { color: "#4A4A4F" }]}
                    >
                      {formatPrice(contentData.price)}
                    </CustomText>
                  )}
                </View>
              </CustomView>

              {/* About Section */}
              <CustomView style={styles.aboutSection}>
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.aboutTitle, { color: colors.label_dark }]}
                >
                  About
                </CustomText>
                <CustomText
                  style={[styles.aboutText, { color: colors.gray_regular }]}
                >
                  {trimString(contentData.description) ||
                    "No description available."}
                </CustomText>
              </CustomView>

              {/* Location Section with Map */}
              {contentData?.googleMapsUrl && (
                <CustomView style={styles.locationSection}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.locationTitle, { color: colors.label_dark }]}
                  >
                    Location
                  </CustomText>
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      initialRegion={{
                        ...extractCoordinatesFromUrl(contentData.googleMapsUrl),
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                      mapType="standard"
                    >
                      <Marker
                        coordinate={extractCoordinatesFromUrl(
                          contentData.googleMapsUrl
                        )}
                        title={
                          trimString(contentData.title) ||
                          trimString(contentData.address) ||
                          trimString(contentData.category) ||
                          "Location"
                        }
                      />
                    </MapView>
                    <TouchableOpacity
                      style={styles.mapOverlay}
                      onPress={openOnMap}
                      activeOpacity={0.7}
                    />
                  </View>
                </CustomView>
              )}

              {/* Add bottom padding to account for fixed buttons */}
              <View style={{ height: verticalScale(80) }} />
            </CustomView>
          </BottomSheetScrollView>
        </BottomSheet>

        {/* Fixed Bottom Action Bar - Always Visible */}
      </CustomView>

      {/* Your existing bottom sheets */}
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
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    // Height is set dynamically via style prop
  },
  imageCarousel: {
    flex: 1,
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    // Height is set dynamically via style prop
    backgroundColor: "#fff",
  },
  headerContainer: {
    width: "100%",
    backgroundColor: "transparent",
  },
  backHeaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  imageIndicators: {
    position: "absolute",
    bottom: verticalScale(35),
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomSheetShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  panelContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(20),
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: verticalScale(8),
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: scaleFontSize(24),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  infoText: {
    fontSize: scaleFontSize(14),
  },
  dotSeparator: {
    paddingHorizontal: horizontalScale(6),
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: verticalScale(4),
  },
  similarityText: {
    fontSize: scaleFontSize(24),
  },
  matchText: {
    fontSize: scaleFontSize(12),
    marginLeft: horizontalScale(4),
  },
  locationSection: {
    marginBottom: verticalScale(20),
  },
  locationTitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(12),
  },
  mapContainer: {
    height: verticalScale(160),
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    fontSize: scaleFontSize(16),
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  priceText: {
    fontSize: scaleFontSize(24),
    marginBottom: verticalScale(4),
  },
  perPersonText: {
    fontSize: scaleFontSize(12),
  },
  phoneText: {
    fontSize: scaleFontSize(14),
  },
  locationText: {
    fontSize: scaleFontSize(14),
  },
  contactButton: {
    marginBottom: verticalScale(4),
  },
  locationButton: {
    marginTop: verticalScale(6),
  },
  aboutSection: {
    marginBottom: verticalScale(16),
  },
  aboutTitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(8),
  },
  aboutText: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bucketContainer: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  // Fixed Bottom Bar Styles
  fixedBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: verticalScale(12),
    zIndex: 0,
  },
  mainActionsContainer: {
    flexDirection: "row",
    flex: 1,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  dislikeButton: {
    // Additional styles for dislike button if needed
  },
  likeButton: {
    // Additional styles for like button if needed
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: scaleFontSize(15),
  },
  moreIcon: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EventDetailsScreen;
