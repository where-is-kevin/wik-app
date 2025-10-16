// components/SwipeCards.tsx - Using rn-swiper-list with card stacking fix
import React, { useCallback, useRef, useState, useEffect } from "react";
import { StyleSheet, View, Animated, Platform, Image } from "react-native";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";
import { OptimizedImageBackground } from "../OptimizedImage/OptimizedImage";
import { CardContentOverlay } from "./CardContentOverlay";
import { getImageSource } from "@/utilities/imageHelpers";
import { useTheme } from "@/contexts/ThemeContext";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import { STATIC_IMAGES } from "@/constants/images";

export interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  rating?: string;
  category?: string;
  websiteUrl?: string;
  address?: string;
  isSponsored?: boolean;
  contentShareUrl: string;
  tags?: string;
  similarity: string | number;
  distance?: number;
  eventDatetimeStart?: string;
  eventDatetimeEnd?: string;
}

interface SwipeCardsProps {
  data: CardData[];
  onSwipeLeft: (item: CardData) => void;
  onSwipeRight: (item: CardData) => void;
  onSwipeUp: (item: CardData) => void;
  onComplete: () => void;
  isLoading: boolean;
  onCardTap?: (item: CardData) => void;
  onBucketPress?: (itemId: string) => void;
  hideButtons?: boolean;
  showLoaderOnComplete?: boolean;
  fullWidth?: boolean; // New prop for onboarding
}

const SwipeCards: React.FC<SwipeCardsProps> = ({
  data,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onComplete,
  isLoading,
  onCardTap,
  onBucketPress,
  hideButtons = false,
  showLoaderOnComplete = false,
  fullWidth = false,
}) => {
  const ref = useRef<SwiperCardRefType>();
  const { colors } = useTheme();

  const [isCompleting, setIsCompleting] = React.useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const [loadedImageCount, setLoadedImageCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Android-specific optimizations
  const isAndroid = Platform.OS === "android";
  const preloadCount = isAndroid ? 1 : 2; // Further reduced for faster Android loading

  // Memoize data dependencies to avoid unnecessary re-renders
  const dataLength = data?.length || 0;
  const firstItemId = data?.[0]?.id;
  const hasData = dataLength > 0;

  // Track if we've already processed this data set
  const lastProcessedDataRef = useRef<string>("");
  const currentDataKey = `${dataLength}-${firstItemId}`;

  // Calculate how many images we need to wait for before showing cards (less than preloadCount for faster display)
  const requiredImageCount = Math.min(dataLength, isAndroid ? 1 : 2); // Wait for at least 1 image to load before showing

  // Use ref-based tracking to avoid state updates causing re-renders
  const imageCountRef = useRef(0);
  const hasTriggeredShowRef = useRef(false);

  // Reset image loading state when data changes
  useEffect(() => {
    if (currentDataKey !== lastProcessedDataRef.current) {
      setLoadedImageCount(0);
      imageCountRef.current = 0;
      hasTriggeredShowRef.current = false;
    }
  }, [currentDataKey]);

  // Check if enough images are ready - be more lenient for faster loading
  const areImagesReady =
    loadedImageCount >= requiredImageCount ||
    !hasData ||
    (loadedImageCount > 0 && dataLength <= 2) ||
    dataLength === 1; // For single cards, don't wait for image loading to show card

  // Track current fallback timer to clear it when images load
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to avoid stale closures and reduce dependencies
  const stateRef = useRef({
    imagesLoaded: false,
    loadedImageCount: 0,
    requiredImageCount,
    hasData,
    dataLength,
  });

  // Update ref values when they change
  stateRef.current = {
    imagesLoaded,
    loadedImageCount,
    requiredImageCount,
    hasData,
    dataLength,
  };

  // Optimized callback to show cards immediately when images are ready
  const checkAndShowCards = useCallback(() => {
    const {
      imagesLoaded: currentImagesLoaded,
      requiredImageCount: currentRequiredImageCount,
      hasData: currentHasData,
      dataLength: currentDataLength,
    } = stateRef.current;
    const currentLoadedImageCount = imageCountRef.current;

    // Check current state values directly to avoid stale closures
    const currentAreImagesReady =
      currentLoadedImageCount >= currentRequiredImageCount ||
      !currentHasData ||
      (currentLoadedImageCount > 0 && currentDataLength <= 2) ||
      currentDataLength === 1;

    if (currentAreImagesReady && !currentImagesLoaded) {
      // Clear the fallback timer since images are ready
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      // Show cards immediately
      setImagesLoaded(true);
      setSwiperReady(true);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim]);

  // Optimized image loading callbacks that prevent excessive re-renders
  const handleImageLoad = useCallback(() => {
    imageCountRef.current += 1;
    const newCount = imageCountRef.current;

    // Only trigger checkAndShowCards once when requirements are met
    if (
      newCount >= requiredImageCount &&
      !hasTriggeredShowRef.current &&
      !imagesLoaded
    ) {
      hasTriggeredShowRef.current = true;
      setTimeout(checkAndShowCards, 0);
    }
  }, [checkAndShowCards, requiredImageCount, imagesLoaded]);

  // Image error callback with optimized updates
  const handleImageError = useCallback(() => {
    imageCountRef.current += 1;
    const newCount = imageCountRef.current;

    // Only trigger checkAndShowCards once when requirements are met
    if (
      newCount >= requiredImageCount &&
      !hasTriggeredShowRef.current &&
      !imagesLoaded
    ) {
      hasTriggeredShowRef.current = true;
      setTimeout(checkAndShowCards, 0);
    }
  }, [checkAndShowCards, requiredImageCount, imagesLoaded]);

  // Optimized loading state management - no polling
  useEffect(() => {
    // Skip if we've already processed this exact data set
    if (
      currentDataKey === lastProcessedDataRef.current &&
      hasData &&
      imagesLoaded
    ) {
      return;
    }

    lastProcessedDataRef.current = currentDataKey;

    if (!data || data.length === 0) {
      setImagesLoaded(true);
      setSwiperReady(true);
      fadeAnim.setValue(1);
      return;
    }

    // Reset states for new data
    fadeAnim.setValue(0);
    setImagesLoaded(false);
    setSwiperReady(false);

    let hasShown = false;
    const showCards = () => {
      if (hasShown) return;
      hasShown = true;

      setImagesLoaded(true);
      setSwiperReady(true);

      // Immediate display
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    // Check immediately if images are already ready (cached images)
    if (areImagesReady) {
      showCards();
      return;
    }

    // Single fallback timer - no polling interval needed
    fallbackTimerRef.current = setTimeout(
      () => {
        if (!hasShown) {
          showCards();
        }
      },
      isAndroid ? 100 : 200
    );

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [
    data,
    currentDataKey,
    hasData,
    imagesLoaded,
    fadeAnim,
    isAndroid,
    areImagesReady,
  ]);

  const handleSwipeRight = (cardIndex: number) => {
    if (data && data[cardIndex]) {
      onSwipeRight(data[cardIndex]);
    }
  };

  const handleSwipeLeft = (cardIndex: number) => {
    if (data && data[cardIndex]) {
      onSwipeLeft(data[cardIndex]);
    }
  };

  const handleSwipeTop = (cardIndex: number) => {
    if (data && data[cardIndex]) {
      const card = data[cardIndex];

      // Call the parent's onSwipeUp handler - let parent decide what to do
      onSwipeUp(card);
    }
  };

  const handleSwipedAll = useCallback(() => {
    if (isCompleting) return; // Prevent multiple calls

    setIsCompleting(true);
    onComplete();

    // Simple timeout to reset completion
    setTimeout(() => {
      setIsCompleting(false);
    }, 500);
  }, [onComplete, isCompleting]);

  const renderCard = useCallback(
    (card: CardData, index: number) => {
      const imageSource = getImageSource(card.imageUrl);
      // For single cards, always treat as preload card; otherwise use preload count
      const isPreloadCard = dataLength === 1 ? true : index < preloadCount;

      return (
        <View
          style={[
            styles.renderCardContainer,
            fullWidth && { paddingHorizontal: 0 },
          ]}
        >
          <OptimizedImageBackground
            source={imageSource}
            style={styles.cardStyle}
            contentFit="cover"
            priority={isPreloadCard ? "high" : "normal"}
            showLoadingIndicator={isPreloadCard}
            borderRadius={15}
            onLoad={() => {
              if (isPreloadCard) {
                handleImageLoad();
              }
            }}
            onError={() => {
              if (isPreloadCard) {
                handleImageError();
              }
            }}
            cachePolicy="memory-disk"
          >
            <CardContentOverlay
              item={card}
              colors={colors}
              onBucketPress={onBucketPress}
              hideButtons={hideButtons}
              onCardTap={onCardTap}
            />
          </OptimizedImageBackground>
        </View>
      );
    },
    [
      colors,
      onBucketPress,
      hideButtons,
      onCardTap,
      preloadCount,
      handleImageLoad,
      handleImageError,
      fullWidth,
      dataLength,
    ]
  );

  const OverlayLabelRight = useCallback(() => {
    return (
      <View style={styles.overlayLabelRight}>
        <Image
          source={STATIC_IMAGES.APPROVE_IMAGE}
          style={styles.overlayIcon}
          resizeMode="contain"
        />
      </View>
    );
  }, []);

  const OverlayLabelLeft = useCallback(() => {
    return (
      <View style={styles.overlayLabelLeft}>
        <Image
          source={STATIC_IMAGES.CANCEL_IMAGE}
          style={styles.overlayIcon}
          resizeMode="contain"
        />
      </View>
    );
  }, []);

  const OverlayLabelTop = useCallback(() => {
    return (
      <View style={styles.overlayLabelTop}>
        <Image
          source={STATIC_IMAGES.ARROW_UP}
          style={styles.overlayIcon}
          resizeMode="contain"
        />
      </View>
    );
  }, []);

  // Show only loader during completion to prevent card stacking
  if (isCompleting || (showLoaderOnComplete && isLoading)) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <AnimatedLoader />
        </View>
      </View>
    );
  }

  // Show loader while initial data is loading OR while images are being preloaded OR while swiper is preparing
  // For single cards, bypass complex loading logic
  if (dataLength === 1) {
    if (isLoading) {
      return (
        <View style={styles.container}>
          <AnimatedLoader />
        </View>
      );
    }
  } else {
    // Multi-card loading logic
    if (isLoading || !imagesLoaded || !swiperReady) {
      return (
        <View style={styles.container}>
          <AnimatedLoader />
        </View>
      );
    }
  }

  // If no data, return null to let parent handle empty state
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.subContainer, { opacity: fadeAnim }]}>
        {!isCompleting && swiperReady && (
          <Swiper
            key={`swiper-${data?.[0]?.id || "empty"}-${
              areImagesReady ? "ready" : "loading"
            }`}
            ref={ref}
            data={data}
            cardStyle={styles.cardStyle}
            overlayLabelContainerStyle={styles.overlayLabelContainerStyle}
            renderCard={renderCard}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSwipeTop={handleSwipeTop}
            onSwipedAll={handleSwipedAll}
            onPress={undefined}
            onIndexChange={() => {}}
            OverlayLabelRight={OverlayLabelRight}
            OverlayLabelLeft={OverlayLabelLeft}
            OverlayLabelTop={OverlayLabelTop}
            disableBottomSwipe={true}
            disableTopSwipe={false}
            swipeVelocityThreshold={isAndroid ? 120 : 150} // Higher threshold for better direction detection
            swipeTopSpringConfig={{
              damping: isAndroid ? 20 : 25, // Reduced damping for smoother upward movement
              stiffness: isAndroid ? 200 : 250, // Higher stiffness for faster response
              mass: 0.3, // Reduced mass for quicker animation
              overshootClamping: true,
              restDisplacementThreshold: 0.1, // Higher threshold for faster completion
              restSpeedThreshold: 0.1,
            }}
            prerenderItems={
              dataLength === 1
                ? 1
                : Math.max(2, Math.min(data.length - 1, isAndroid ? 3 : 4))
            }
            keyExtractor={(item, index) =>
              `${item.id}-${index}-${currentDataKey}`
            }
            // Configure overlay opacity ranges with much higher vertical threshold
            inputOverlayLabelRightOpacityRange={[30, 120]} // Horizontal right range
            outputOverlayLabelRightOpacityRange={[0, 1]}
            inputOverlayLabelLeftOpacityRange={[-120, -30]} // Horizontal left range
            outputOverlayLabelLeftOpacityRange={[1, 0]}
            inputOverlayLabelTopOpacityRange={[-80, -200]} // Much higher vertical threshold - swipe up only appears with significant upward movement
            outputOverlayLabelTopOpacityRange={[0, 1]}
            // Enhanced card movement - smoother, less chaotic animations
            rotateInputRange={[-150, 0, 150]} // Wider range for smoother rotation
            rotateOutputRange={[-Math.PI / 12, 0, Math.PI / 12]} // Reduced rotation for less chaotic feel
            translateYRange={isAndroid ? [-8, 0, -8] : [-12, 0, -12]} // Reduced Y translation
            swipeRightSpringConfig={{
              damping: isAndroid ? 35 : 40, // Reduced damping for smoother horizontal swipes
              stiffness: isAndroid ? 180 : 200, // Higher stiffness for faster response
              mass: isAndroid ? 0.8 : 1.0, // Reduced mass for quicker animation
              overshootClamping: true,
              restDisplacementThreshold: 0.1, // Higher threshold for faster completion
              restSpeedThreshold: 0.1,
            }}
            swipeLeftSpringConfig={{
              damping: isAndroid ? 35 : 40, // Reduced damping for smoother horizontal swipes
              stiffness: isAndroid ? 180 : 200, // Higher stiffness for faster response
              mass: isAndroid ? 0.8 : 1.0, // Reduced mass for quicker animation
              overshootClamping: true,
              restDisplacementThreshold: 0.1, // Higher threshold for faster completion
              restSpeedThreshold: 0.1,
            }}
            swipeBackXSpringConfig={{
              damping: isAndroid ? 30 : 35, // Smooth bounce back on X-axis
              stiffness: isAndroid ? 220 : 250, // High stiffness for quick return
              mass: 0.5,
              overshootClamping: false, // Allow small overshoot for natural bounce
              restDisplacementThreshold: 0.1,
              restSpeedThreshold: 0.1,
            }}
            swipeBackYSpringConfig={{
              damping: isAndroid ? 30 : 35, // Smooth bounce back on Y-axis
              stiffness: isAndroid ? 220 : 250, // High stiffness for quick return
              mass: 0.5,
              overshootClamping: false, // Allow small overshoot for natural bounce
              restDisplacementThreshold: 0.1,
              restSpeedThreshold: 0.1,
            }}
          />
        )}
        {isCompleting && (
          <View style={styles.loadingContainer}>
            <AnimatedLoader />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  renderCardContainer: {
    borderRadius: 16,
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(10),
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  cardStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  overlayLabelLeft: {
    left: "60%",
    top: "20%",
  },
  overlayLabelRight: {
    left: "15%",
    top: "20%",
  },
  overlayLabelTop: {
    top: "40%",
    alignSelf: "center",
  },
  overlayIcon: {
    width: horizontalScale(80),
    height: verticalScale(80),
  },
  overlayLabelContainer: {
    borderRadius: 16,
    height: "100%",
    width: "100%",
  },
  overlayLabelContainerStyle: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

// Memoize the component to prevent unnecessary re-renders from parent callback changes
const MemoizedSwipeCards = React.memo(SwipeCards, (prevProps, nextProps) => {
  // Only re-render if meaningful props have changed
  const meaningfulProps = [
    "data",
    "isLoading",
    "hideButtons",
    "showLoaderOnComplete",
    "fullWidth",
  ] as const;

  for (const prop of meaningfulProps) {
    if (prevProps[prop] !== nextProps[prop]) {
      return false; // Props changed, re-render
    }
  }

  // Check if data array has same length and first item (lightweight check)
  if (Array.isArray(prevProps.data) && Array.isArray(nextProps.data)) {
    if (prevProps.data.length !== nextProps.data.length) {
      return false;
    }
    if (prevProps.data[0]?.id !== nextProps.data[0]?.id) {
      return false;
    }
  }

  return true; // Props haven't meaningfully changed, skip re-render
});

export default MemoizedSwipeCards;
