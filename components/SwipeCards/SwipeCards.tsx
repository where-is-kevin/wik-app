// components/SwipeCards.tsx - Using rn-swiper-list with card stacking fix
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Linking,
  Alert,
  Platform,
} from "react-native";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";
import CustomText from "../CustomText";
import { OptimizedImageBackground } from "../OptimizedImage/OptimizedImage";
import { CardContentOverlay } from "./CardContentOverlay";
import { getImageSource } from "@/utilities/imageHelpers";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

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
  eventDatetime?: string;
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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [loadedImageCount, setLoadedImageCount] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Android-specific optimizations
  const isAndroid = Platform.OS === "android";
  const preloadCount = isAndroid ? 3 : 4; // Enough for deck appearance but still fast
  const minLoadTime = 0; // No artificial delay - show as soon as images are ready
  const fadeDelay = 0; // No fade delay - instant appearance

  // Memoize data dependencies to avoid unnecessary re-renders
  const dataLength = data?.length || 0;
  const firstItemId = data?.[0]?.id;
  const hasData = dataLength > 0;

  // Track if we've already processed this data set
  const lastProcessedDataRef = useRef<string>("");
  const currentDataKey = `${dataLength}-${firstItemId}`;

  // Calculate how many images we need to wait for before showing cards (less than preloadCount for faster display)
  const requiredImageCount = Math.min(dataLength, isAndroid ? 2 : 2); // Wait for just 2 images for deck

  // Reset image loading state when data changes
  useEffect(() => {
    if (currentDataKey !== lastProcessedDataRef.current) {
      setLoadedImageCount(0);
      setImageLoadErrors(new Set());
    }
  }, [currentDataKey]);

  // Image loading callback
  const handleImageLoad = useCallback(() => {
    setLoadedImageCount((prev) => prev + 1);
  }, []);

  // Image error callback
  const handleImageError = useCallback((imageUrl: string) => {
    setImageLoadErrors((prev) => {
      const newSet = new Set(prev);
      newSet.add(imageUrl);
      return newSet;
    });
    // Count errors as "loaded" to prevent infinite waiting
    setLoadedImageCount((prev) => prev + 1);
  }, []);

  // Check if enough images are ready - be more lenient for faster loading
  const areImagesReady = loadedImageCount >= requiredImageCount || !hasData ||
    (loadedImageCount > 0 && dataLength <= 2); // If we have few cards, just wait for 1 image

  // Main loading and ready state management
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


    // Loading with small delay to ensure swiper is properly initialized
    let hasShown = false;
    const showCards = () => {
      if (hasShown) return;
      hasShown = true;

      setImagesLoaded(true);
      setSwiperReady(true);
      setIsFirstLoad(false);

      // Immediate display like main tabs
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const checkImagesReady = () => {
      if (areImagesReady) {
        showCards();
      }
    };

    // Check immediately and set up interval to keep checking
    checkImagesReady();
    const interval = setInterval(checkImagesReady, 50);

    // Short fallback to ensure cards always show
    setTimeout(
      () => {
        clearInterval(interval);
        if (!hasShown) {
          showCards();
        }
      },
      isAndroid ? 400 : 300
    ); // Very short fallback for guaranteed display

    return () => clearInterval(interval);
  }, [
    data,
    dataLength,
    firstItemId,
    currentDataKey,
    hasData,
    fadeAnim,
    isFirstLoad,
    areImagesReady,
    imagesLoaded,
    minLoadTime,
    fadeDelay,
    isAndroid,
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

      // Trigger URL linking instead of removing card
      if (card?.websiteUrl) {
        Linking.openURL(card.websiteUrl).catch(() => {
          Alert.alert(
            "Unable to Open",
            "Could not open the website for this content."
          );
        });
      } else {
        Alert.alert("No Website", "No website is available for this content.");
      }

      // Don't call onSwipeUp to prevent card from being removed from stack
      // The card should snap back to position due to the spring config
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
            onLoad={() => {
              if (isPreloadCard) {
                handleImageLoad();
              }
            }}
            onError={() => {
              if (isPreloadCard) {
                handleImageError(card.imageUrl);
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
    ]
  );

  const OverlayLabelRight = useCallback(() => {
    return (
      <View style={styles.overlayLabelRight}>
        <View
          style={[styles.overlayLabelBackground, { borderColor: colors.lime }]}
        >
          <CustomText style={[styles.overlayText, { color: colors.lime }]}>
            LIKE
          </CustomText>
        </View>
      </View>
    );
  }, [colors]);

  const OverlayLabelLeft = useCallback(() => {
    return (
      <View style={styles.overlayLabelLeft}>
        <View
          style={[styles.overlayLabelBackground, { borderColor: colors.bordo }]}
        >
          <CustomText style={[styles.overlayText, { color: colors.bordo }]}>
            SKIP
          </CustomText>
        </View>
      </View>
    );
  }, [colors]);

  const OverlayLabelTop = useCallback(() => {
    return (
      <View style={styles.overlayLabelTop}>
        <View
          style={[
            styles.overlayLabelBackground,
            { borderColor: colors.card_purple },
          ]}
        >
          <CustomText
            style={[styles.overlayText, { color: colors.card_purple }]}
          >
            VISIT
          </CustomText>
        </View>
      </View>
    );
  }, [colors]);

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
            swipeVelocityThreshold={isAndroid ? 120 : 150}
            swipeTopSpringConfig={{
              damping: isAndroid ? 20 : 15,
              stiffness: isAndroid ? 120 : 150,
              mass: 1,
              overshootClamping: false,
              restDisplacementThreshold: 0.1,
              restSpeedThreshold: 0.1,
            }}
            prerenderItems={Math.min(
              data.length - 1,
              preloadCount
            )}
            keyExtractor={(item, index) =>
              `${item.id}-${index}-${currentDataKey}`
            }
            // Configure overlay opacity ranges to make them mutually exclusive - very strict
            inputOverlayLabelRightOpacityRange={[50, 120]}
            outputOverlayLabelRightOpacityRange={[0, 1]}
            inputOverlayLabelLeftOpacityRange={[-120, -50]}
            outputOverlayLabelLeftOpacityRange={[1, 0]}
            inputOverlayLabelTopOpacityRange={[-120, -50]}
            outputOverlayLabelTopOpacityRange={[1, 0]}
            // Enhanced card movement - more realistic pickup animation (Android optimized)
            rotateInputRange={[-120, 0, 120]}
            rotateOutputRange={[-Math.PI / 8, 0, Math.PI / 8]}
            translateYRange={isAndroid ? [-10, 0, -10] : [-15, 0, -15]}
            swipeRightSpringConfig={{
              damping: isAndroid ? 40 : 50,
              stiffness: isAndroid ? 300 : 400,
              mass: isAndroid ? 0.5 : 0.3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            }}
            swipeLeftSpringConfig={{
              damping: isAndroid ? 40 : 50,
              stiffness: isAndroid ? 300 : 400,
              mass: isAndroid ? 0.5 : 0.3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
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
    left: "50%",
    top: "20%",
  },
  overlayLabelRight: {
    right: "-15%",
    top: "20%",
  },
  overlayLabelTop: {
    top: "20%",
    alignSelf: "center",
  },
  overlayText: {
    fontSize: scaleFontSize(18),
    fontWeight: "bold",
    textAlign: "center",
  },
  overlayLabelBackground: {
    width: horizontalScale(120),
    height: verticalScale(60),
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    // borderColor: "rgba(255, 255, 255, 0.8)",
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

export default SwipeCards;
