// components/SwipeCard.tsx
import React, { useCallback, useMemo } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "@/components/CustomText";
import { scaleFontSize } from "@/utilities/scaling";
import { OptimizedImageBackground } from "../OptimizedImage/OptimizedImage";
import { CardContentOverlay } from "./CardContentOverlay";
import AnimatedLoader from "../Loader/AnimatedLoader";
import { getImageSource } from "@/utilities/imageHelpers";
import { STATIC_IMAGES } from "@/constants/images";

interface CardData {
  id: string;
  title: string;
  imageUrl: string;
  price?: string;
  rating?: string;
  category?: string;
  address?: string;
  isSponsored?: boolean;
  contentShareUrl: string;
  tags?: string;
  similarity: number;
}

interface SwipeCardProps {
  item: CardData;
  isCurrentCard: boolean;
  isNextCard: boolean;
  panHandlers?: any;
  animatedStyle?: any;
  colors: any;
  onBucketPress?: (value: string) => void;
  hideBucketsButton?: boolean;
  onImageLoad: (itemId: string) => void;
  onImageError: (itemId: string) => void;
  imageLoaded: boolean;
}

export const SwipeCard = React.memo<SwipeCardProps>(
  ({
    item,
    isCurrentCard,
    isNextCard,
    panHandlers,
    animatedStyle,
    colors,
    onBucketPress,
    hideBucketsButton,
    onImageLoad,
    onImageError,
    imageLoaded,
  }) => {
    const imageSource = useMemo(
      () => getImageSource(item.imageUrl),
      [item.imageUrl]
    );

    const handleImageLoad = useCallback(() => {
      onImageLoad(item.id);
    }, [onImageLoad, item.id]);

    const handleImageError = useCallback(() => {
      onImageError(item.id);
    }, [onImageError, item.id]);

    // Show loader for current card while image is loading
    if (isCurrentCard && !imageLoaded) {
      return (
        <View key={item.id} style={styles.loaderContainer}>
          <AnimatedLoader />
          {/* Hidden image to trigger loading */}
          <OptimizedImageBackground
            source={imageSource}
            style={{ width: 0, height: 0 }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            showLoader={false}
            fallbackSource={STATIC_IMAGES.PLACEHOLDER_IMAGE}
            priority="high"
          />
        </View>
      );
    }

    const renderCardContent = () => {
      if (isCurrentCard) {
        return (
          <CardContentOverlay
            item={item}
            colors={colors}
            onBucketPress={onBucketPress}
            hideBucketsButton={hideBucketsButton}
          />
        );
      }

      // Simplified content for next card
      return (
        <LinearGradient
          colors={["rgba(242, 242, 243, 0)", "#0B2E34"]}
          style={styles.gradientOverlay}
        >
          <View style={styles.cardContent}>
            <CustomText
              fontFamily="Inter-SemiBold"
              style={[styles.cardTitle, { color: colors.background }]}
            >
              {item.title}
            </CustomText>
          </View>
        </LinearGradient>
      );
    };

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.cardStyle,
          animatedStyle,
          isNextCard && {
            opacity: 0.5,
            transform: [{ scale: 0.9 }],
            top: 10,
            zIndex: -1,
          },
        ]}
        {...(isCurrentCard ? panHandlers : {})}
      >
        <OptimizedImageBackground
          source={imageSource}
          style={styles.cardImage}
          resizeMode="cover"
          priority={isCurrentCard ? "high" : "normal"}
          showLoader={false}
          fallbackSource={STATIC_IMAGES.PLACEHOLDER_IMAGE}
          onLoad={handleImageLoad}
          onError={handleImageError}
        >
          {renderCardContent()}
        </OptimizedImageBackground>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  loaderContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  cardStyle: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
  },
  cardContent: {
    padding: 12,
    paddingBottom: 16,
  },
  cardTitle: {
    fontSize: scaleFontSize(24),
    marginBottom: 6,
  },
});
