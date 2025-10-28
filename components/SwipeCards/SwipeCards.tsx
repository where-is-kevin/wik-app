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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Android-specific optimizations
  const isAndroid = Platform.OS === "android";

  // Memoize data dependencies to avoid unnecessary re-renders
  const dataLength = data?.length || 0;

  // FROM WORKING VERSION: Minimal preload but wait for first image
  const preloadCount = isAndroid ? 1 : 2; // Key difference from working version
  const hasData = dataLength > 0;

  // FROM FAST VERSION: Track image loading AND swiper ready state separately
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [swiperReady, setSwiperReady] = useState(false);
  const [loadedImageCount, setLoadedImageCount] = useState(0);
  const requiredImageCount = Math.min(dataLength, isAndroid ? 1 : 2);

  // FROM FAST VERSION: Reset when data changes
  useEffect(() => {
    if (hasData) {
      setImagesLoaded(false);
      setSwiperReady(false);
      setLoadedImageCount(0);
      fadeAnim.setValue(0);
    }
  }, [hasData, fadeAnim]);

  // FROM FAST VERSION: Show cards when enough images load OR fallback timeout
  useEffect(() => {
    if (!hasData) return;

    const areImagesReady = loadedImageCount >= requiredImageCount;

    if (areImagesReady && !imagesLoaded) {
      setImagesLoaded(true);
      setSwiperReady(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (!imagesLoaded) {
      // Fallback timer from fast version
      const timer = setTimeout(
        () => {
          setImagesLoaded(true);
          setSwiperReady(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        },
        isAndroid ? 100 : 200
      );

      return () => clearTimeout(timer);
    }
  }, [
    hasData,
    loadedImageCount,
    requiredImageCount,
    imagesLoaded,
    fadeAnim,
    isAndroid,
  ]);

  // All complex loading logic removed - cards show immediately with data

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
      const isPreloadCard = index < preloadCount;

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
            cachePolicy="memory-disk"
            onLoad={() => {
              if (isPreloadCard) {
                setLoadedImageCount((prev) => prev + 1);
              }
            }}
            onError={() => {
              if (isPreloadCard) {
                setLoadedImageCount((prev) => prev + 1);
              }
            }}
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
    [colors, onBucketPress, hideButtons, onCardTap, fullWidth, preloadCount]
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

  if (isLoading || !imagesLoaded || !swiperReady) {
    return (
      <View style={styles.container}>
        <AnimatedLoader />
      </View>
    );
  }

  // If no data, return null to let parent handle empty state
  if (!data || data.length === 0) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.subContainer, { opacity: fadeAnim }]}>
        {!isCompleting && (
          <Swiper
            key={`swiper-${data?.[0]?.id || "empty"}`}
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
            prerenderItems={isAndroid ? 2 : 3}
            keyExtractor={(item, index) => `${item.id}-${index}`}
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
