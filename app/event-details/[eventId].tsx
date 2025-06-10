import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
  StatusBar,
  ScrollView,
  View,
  Linking,
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

const SCREEN_HEIGHT = Dimensions.get("window").height;

interface EventDetailsScreenProps {}

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Get the event ID from params
  const eventId = params.eventId as string;

  // Fetch content data using the eventId
  const { data: contentData, isLoading, error } = useContentById(eventId);

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

  // Estimated header height - adjusted based on your setup
  const ESTIMATED_HEADER_HEIGHT = verticalScale(10) + 12 + 24;
  // Panel heights
  const PANEL_MIN_HEIGHT = SCREEN_HEIGHT * 0.3;
  const PANEL_MAX_HEIGHT = SCREEN_HEIGHT - insets.top - ESTIMATED_HEADER_HEIGHT;

  const panelHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);

  // Ref to access the ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Allow ScrollView to take over when panel is expanded and user is scrolling up
        if (isPanelExpanded && gesture.dy < 0) {
          return false;
        }
        return true;
      },
      onPanResponderMove: (_, gesture) => {
        // Calculate new panel height based on gesture
        const newHeight = isPanelExpanded
          ? PANEL_MAX_HEIGHT - gesture.dy
          : PANEL_MIN_HEIGHT - gesture.dy;

        // Constrain panel height between min and max values
        if (newHeight >= PANEL_MIN_HEIGHT && newHeight <= PANEL_MAX_HEIGHT) {
          panelHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        // Determine if panel should snap to min or max height
        if (isPanelExpanded) {
          if (gesture.dy > 50) {
            // Collapse panel if dragged down more than 50 units
            snapPanel(false);
          } else {
            // Keep panel expanded
            snapPanel(true);
          }
        } else {
          if (gesture.dy < -50) {
            // Expand panel if dragged up more than 50 units
            snapPanel(true);
          } else {
            // Keep panel collapsed
            snapPanel(false);
          }
        }
      },
    })
  ).current;

  const snapPanel = (expand: boolean) => {
    setIsPanelExpanded(expand);
    setIsScrollEnabled(expand); // Only enable scroll when panel is expanded

    Animated.spring(panelHeight, {
      toValue: expand ? PANEL_MAX_HEIGHT : PANEL_MIN_HEIGHT,
      friction: 8,
      useNativeDriver: false,
    }).start(() => {
      // Scroll to top when panel is collapsed
      if (!expand && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    });
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
    setSelectedItemId(null);
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

        console.log(`Successfully added item to bucket "${item.title}"`);
      } catch (error) {
        console.error("Failed to add item to bucket:", error);
      }
    }
  };

  const handleShowCreateBucketBottomSheet = () => {
    setIsBucketBottomSheetVisible(false);
    setIsCreateBucketBottomSheetVisible(true);
  };

  const handleCloseCreateBucketBottomSheet = () => {
    setIsCreateBucketBottomSheetVisible(false);
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
        console.log(`Successfully created bucket "${bucketName}"`);
      } catch (error) {
        console.error("Failed to create bucket:", error);
      }
    }
  };

  // Helper function to format price
  const formatPrice = (price: number | null) => {
    if (price === null) return "Price on request";
    return `£${price}`;
  };

  // Helper function to get image source
  const getImageSource = () => {
    if (contentData?.googlePlacesImageUrl) {
      return { uri: contentData.googlePlacesImageUrl };
    }
    return TestImage; // Fallback to default image
  };

  const openOnMap = () => {
    if (contentData?.websiteUrl) {
      Linking.openURL(contentData.websiteUrl).catch((err) => {
        console.error("Failed to open URL:", err);
      });
    } else {
      console.log("No website URL available for this item");
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
    <>
      <CustomView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <ImageBackground
          source={getImageSource()}
          style={styles.backgroundImage}
        >
          <SafeAreaView
            style={[
              styles.headerContainer,
              { backgroundColor: colors.overlay },
            ]}
          >
            <BackHeader transparent={true} />
          </SafeAreaView>
        </ImageBackground>

        {/* Sliding Panel */}
        <Animated.View
          style={[
            styles.panel,
            { height: panelHeight, backgroundColor: colors.background },
          ]}
        >
          {/* Panel Handle - Visual indicator for dragging */}
          <View style={styles.panelHandle} {...panResponder.panHandlers}>
            <View style={styles.panelHandleBar} />
          </View>

          {/* ScrollView for the panel content */}
          <ScrollView
            ref={scrollViewRef}
            scrollEnabled={isScrollEnabled}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            scrollEventThrottle={16}
          >
            {/* Panel Content */}
            <CustomView style={styles.panelContent}>
              {/* EVENT Badge */}
              <CustomView style={styles.badgeContainer}>
                <CustomView
                  bgColor={colors.profile_name_black}
                  style={styles.experienceTag}
                >
                  <CustomText
                    fontFamily="Inter-SemiBold"
                    style={[styles.experienceText, { color: colors.lime }]}
                  >
                    {contentData.category.toUpperCase()}
                  </CustomText>
                </CustomView>

                {/* Action Buttons */}
                <CustomView style={styles.row}>
                  <CustomTouchable
                    style={styles.bucketContainer}
                    bgColor={colors.label_dark}
                    onPress={handleShowBucketBottomSheet}
                  >
                    <BucketSvg />
                  </CustomTouchable>
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
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.title, { color: colors.label_dark }]}
                >
                  {contentData.title}
                </CustomText>
                {/* Price Info */}
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.priceText, { color: colors.event_gray }]}
                >
                  {formatPrice(contentData.price)}{" "}
                  {contentData.price && (
                    <CustomText
                      fontFamily="Inter-SemiBold"
                      style={[
                        styles.perPersonText,
                        { color: colors.event_gray },
                      ]}
                    >
                      /person
                    </CustomText>
                  )}
                </CustomText>
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
            </CustomView>
          </ScrollView>
        </Animated.View>
      </CustomView>

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  headerContainer: {
    width: "100%",
    backgroundColor: "transparent",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  panelHandle: {
    width: "100%",
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  panelHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F2F2F7",
  },
  scrollViewContent: {
    flexGrow: 1,
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: scaleFontSize(10),
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
    marginBottom: verticalScale(4),
  },
  ratingText: {
    fontSize: scaleFontSize(14),
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
  tagsSection: {
    marginBottom: verticalScale(16),
  },
  tagsTitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(8),
  },
  tagsText: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
  },
  reviewsSection: {
    marginBottom: verticalScale(16),
  },
  reviewsTitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(8),
  },
  reviewsText: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: verticalScale(16),
  },
  actionButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: scaleFontSize(14),
  },
  experienceTag: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  experienceText: {
    fontSize: scaleFontSize(10),
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
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: scaleFontSize(16),
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
});

export default EventDetailsScreen;
