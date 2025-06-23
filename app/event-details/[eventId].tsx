import React, { useRef, useMemo, useCallback, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  StatusBar,
  View,
  Linking,
  FlatList,
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
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import BackHeader from "@/components/Header/BackHeader";
import TestImage from "@/assets/images/test-bg.png";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import CustomView from "@/components/CustomView";
import BucketSvg from "@/components/SvgComponents/BucketSvg";
import ShareButton from "@/components/Button/ShareButton";
import { useContentById } from "@/hooks/useContent";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";
import {
  BucketBottomSheet,
  BucketItem,
} from "@/components/BottomSheet/BucketBottomSheet";
import { CreateBucketBottomSheet } from "@/components/BottomSheet/CreateBucketBottomSheet";
import { useAddBucket, useCreateBucket } from "@/hooks/useBuckets";
import CategoryTag from "@/components/Tag/CategoryTag";
import { FastImageBackground } from "@/components/OptimizedImage/OptimizedImage";
import { useAddLike } from "@/hooks/useLikes";
import { useAddDislike } from "@/hooks/useDislikes";
import { useQueryClient } from "@tanstack/react-query";
import StarSvg from "@/components/SvgComponents/StarSvg";
import LikeSvg from "@/components/SvgComponents/LikeSvg";
import LikeFilledSvg from "@/components/SvgComponents/LikeFilledSvg";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

interface EventDetailsScreenProps {}

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Get the event ID from params
  const eventId = params.eventId as string;
  const hideBucketsButton = params.hideBucketsButton === "true";

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
  const ESTIMATED_HEADER_HEIGHT = verticalScale(10) + 12 + 24;
  // Increased the minimum height from 0.3 to 0.45 (45% instead of 30%)
  const PANEL_MIN_HEIGHT = SCREEN_HEIGHT * 0.45;
  const PANEL_MAX_HEIGHT = SCREEN_HEIGHT - insets.top - ESTIMATED_HEADER_HEIGHT;

  // Calculate the image container height to stop at the first snap point
  const IMAGE_CONTAINER_HEIGHT = SCREEN_HEIGHT - PANEL_MIN_HEIGHT + 15;

  // Bottom sheet setup with dynamic snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => {
    const minHeightPercentage = (PANEL_MIN_HEIGHT / SCREEN_HEIGHT) * 100;
    const maxHeightPercentage = (PANEL_MAX_HEIGHT / SCREEN_HEIGHT) * 100;
    return [
      `${minHeightPercentage.toFixed(1)}%`,
      `${maxHeightPercentage.toFixed(1)}%`,
    ];
  }, [PANEL_MIN_HEIGHT, PANEL_MAX_HEIGHT]);

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

  // Handle like press
  const handleLikePress = useCallback(() => {
    if (!contentData || contentData.userLiked || contentData.userDisliked)
      return;

    const likeData = {
      contentIds: [eventId],
    };

    addLikeMutation.mutate(likeData, {
      onSuccess: () => {
        // Update the authenticated query (has userLiked/userDisliked fields)
        queryClient.setQueryData(
          ["content", "byId", eventId, true],
          (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                userLiked: true,
              };
            }
            return oldData;
          }
        );

        // Update the non-authenticated query (basic content data)
        queryClient.setQueryData(
          ["content", "byId", eventId, false],
          (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                userLiked: true,
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

  // Handle dislike press
  const handleDislikePress = useCallback(() => {
    if (!contentData || contentData.userDisliked) return;

    const dislikeData = {
      contentIds: [eventId],
    };

    addDislikeMutation.mutate(dislikeData, {
      onSuccess: () => {
        // Update the authenticated query (has userLiked/userDisliked fields)
        queryClient.setQueryData(
          ["content", "byId", eventId, true],
          (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                userDisliked: true,
              };
            }
            return oldData;
          }
        );

        // Update the non-authenticated query (basic content data)
        queryClient.setQueryData(
          ["content", "byId", eventId, false],
          (oldData: any) => {
            if (oldData) {
              return {
                ...oldData,
                userDisliked: true,
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
  }, [contentData, eventId, addDislikeMutation, queryClient]);

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
      contentData.internalImageUrls.length > 0
    ) {
      return contentData.internalImageUrls;
    }
    if (contentData?.googlePlacesImageUrl) {
      return [contentData.googlePlacesImageUrl];
    }
    return [TestImage]; // Fallback to default image
  };

  const images = useMemo(() => getImages(), [contentData]);

  // Handle image scroll
  const onImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  // Render image item
  const renderImageItem = ({ item }: { item: string }) => (
    <FastImageBackground
      source={typeof item === "string" ? { uri: item } : item}
      style={[styles.backgroundImage, { height: IMAGE_CONTAINER_HEIGHT }]}
      resizeMode="cover"
      priority="high"
      showLoader={true}
      fallbackSource={TestImage}
    >
      <SafeAreaView
        style={[styles.headerContainer, { backgroundColor: colors.overlay }]}
      >
        <BackHeader transparent={true} />
      </SafeAreaView>
    </FastImageBackground>
  );

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
  const formatPrice = (price: number | null) => {
    if (price === null) return "Price on request";
    return `${price}`;
  };

  const openOnMap = () => {
    if (contentData?.googleMapsUrl) {
      Linking.openURL(contentData.googleMapsUrl).catch((err) => {
        // console.error("Failed to open URL:", err);
      });
    } else {
      // console.log("No Google Maps URL available for this item");
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
          <CustomText
            style={[styles.errorText, { color: colors.gray_regular }]}
          >
            Failed to load event details
          </CustomText>
          <CustomTouchable
            style={[
              styles.retryButton,
              { backgroundColor: colors.gray_regular },
            ]}
            onPress={() => router.back()}
          >
            <CustomText
              style={[styles.retryButtonText, { color: colors.gray_regular }]}
            >
              Go Back
            </CustomText>
          </CustomTouchable>
        </View>
      </CustomView>
    );
  }

  // Show not found state
  if (!contentData) {
    return (
      <CustomView style={styles.container}>
        <View style={styles.errorContainer}>
          <CustomText style={[styles.errorText, { color: colors.label_dark }]}>
            Event not found
          </CustomText>
          <CustomTouchable
            style={[
              styles.retryButton,
              { backgroundColor: colors.gray_regular },
            ]}
            onPress={() => router.back()}
          >
            <CustomText
              style={[styles.retryButtonText, { color: colors.text_white }]}
            >
              Go Back
            </CustomText>
          </CustomTouchable>
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
          />

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
                <CustomView style={styles.row}>
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
                      url={contentData.websiteUrl || contentData.googleMapsUrl}
                    />
                  </CustomTouchable>
                </CustomView>
              </CustomView>

              {/* Title Section */}
              <CustomView style={styles.titleSection}>
                <CustomTouchable onPress={handleMoreOptionsPress}>
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.title, { color: colors.label_dark }]}
                  >
                    {contentData.title}
                  </CustomText>
                </CustomTouchable>

                {/* Price or Rating Display */}
                {contentData.price ? (
                  // Show Price with /person
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.priceText, { color: colors.event_gray }]}
                  >
                    {formatPrice(contentData.price)}
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[
                        styles.perPersonText,
                        { color: colors.event_gray },
                      ]}
                    >
                      /person
                    </CustomText>
                  </CustomText>
                ) : contentData.rating ? (
                  // Show Rating with Star
                  <CustomView style={styles.ratingContainer}>
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[styles.ratingText, { color: colors.event_gray }]}
                    >
                      ⭐ {contentData.rating}
                    </CustomText>
                  </CustomView>
                ) : null}
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
                  {contentData.description || "No description available."}
                </CustomText>
              </CustomView>

              {/* Phone */}
              {contentData.phone && (
                <CustomTouchable
                  style={styles.contactButton}
                  onPress={() => {
                    if (contentData.phone) {
                      const phoneNumber = contentData.phone.replace(/\s+/g, "");
                      const phoneUrl = `tel:${phoneNumber}`;

                      Linking.openURL(phoneUrl).catch((err) => {
                        console.error("Failed to open phone dialer:", err);
                      });
                    }
                  }}
                >
                  <CustomText
                    fontFamily="Inter-Medium"
                    style={[styles.phoneText, { color: colors.gray_regular }]}
                  >
                    📞 {contentData.phone}
                  </CustomText>
                </CustomTouchable>
              )}

              {/* Location */}
              {contentData?.googleMapsUrl && (
                <CustomTouchable
                  style={styles.locationButton}
                  onPress={openOnMap}
                >
                  <CustomText
                    fontFamily="Inter-Medium"
                    style={[
                      styles.locationText,
                      { color: colors.gray_regular },
                    ]}
                  >
                    📍 View on Map
                  </CustomText>
                </CustomTouchable>
              )}

              {/* Add bottom padding to account for fixed buttons */}
              <View style={{ height: verticalScale(80) }} />
            </CustomView>
          </BottomSheetScrollView>
        </BottomSheet>

        {/* Fixed Bottom Action Bar - Always Visible */}
        {jwt && (
          <View
            style={[
              styles.fixedBottomBar,
              {
                bottom: insets.bottom,
                backgroundColor: colors.background,
              },
            ]}
          >
            {/* Main Action Buttons Container */}
            <View style={styles.mainActionsContainer}>
              {/* Not for me Button */}
              <CustomTouchable
                style={[styles.actionButton, styles.dislikeButton]}
                bgColor={colors.label_dark}
                onPress={handleDislikePress}
                disabled={
                  addDislikeMutation.isPending || contentData?.userDisliked
                }
              >
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[
                    styles.actionButtonText,
                    { color: colors.text_white },
                  ]}
                >
                  {addDislikeMutation.isPending ? "..." : "Not for me"}
                </CustomText>
              </CustomTouchable>

              {/* Like Button */}
              <CustomTouchable
                style={[styles.actionButton, styles.likeButton]}
                bgColor={colors.lime}
                onPress={handleLikePress}
                disabled={addLikeMutation.isPending || contentData?.userLiked}
              >
                {!contentData?.userLiked ? <LikeSvg /> : <LikeFilledSvg />}
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[
                    styles.actionButtonText,
                    {
                      color: colors.label_dark,
                    },
                  ]}
                >
                  {addLikeMutation.isPending
                    ? "..."
                    : contentData?.userLiked
                    ? "Liked"
                    : "Like"}
                </CustomText>
              </CustomTouchable>
            </View>
          </View>
        )}
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
  imageIndicators: {
    position: "absolute",
    bottom: 35, // Fixed distance from bottom of image container
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
    paddingTop: verticalScale(10),
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
    marginBottom: verticalScale(4),
  },
  ratingText: {
    fontSize: scaleFontSize(18),
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
  errorText: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
  retryButton: {
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: scaleFontSize(14),
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
