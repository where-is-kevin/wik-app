// components/SwipeCard.tsx
import React, { useCallback, useMemo } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "@/components/CustomText";
import { scaleFontSize } from "@/utilities/scaling";
import { OptimizedImageBackground } from "../OptimizedImage/OptimizedImage";
import { CardContentOverlay } from "./CardContentOverlay";
import { getImageSource } from "@/utilities/imageHelpers";

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
  similarity: number | string;
  eventDatetime?: string; // For event type items
}

interface SwipeCardProps {
  item: CardData;
  isCurrentCard: boolean;
  isNextCard: boolean;
  panHandlers?: any;
  animatedStyle?: any;
  colors: any;
  onBucketPress?: (itemId: string) => void;
  hideButtons?: boolean;
  onImageLoad?: (itemId: string) => void;
  onImageError?: (itemId: string) => void;
}

export const SwipeCard = React.memo<SwipeCardProps>(function SwipeCard({
  item,
  isCurrentCard,
  isNextCard,
  panHandlers,
  animatedStyle,
  colors,
  onBucketPress,
  hideButtons,
  onImageLoad,
  onImageError,
}) {
  const imageSource = useMemo(
    () => getImageSource(item.imageUrl),
    [item.imageUrl]
  );

  const handleImageLoad = useCallback(() => {
    onImageLoad?.(item.id);
  }, [onImageLoad, item.id]);

  const handleImageError = useCallback(() => {
    onImageError?.(item.id);
  }, [onImageError, item.id]);

  // Removed complex loading logic - let OptimizedImage handle it

  const renderCardContent = () => {
    if (isCurrentCard) {
      return (
        <CardContentOverlay
          item={item}
          colors={colors}
          onBucketPress={onBucketPress}
          hideButtons={hideButtons}
        />
      );
    }

    // Simplified content for next card - no gradient
    return (
      <View style={[styles.gradientOverlay, { backgroundColor: "rgba(11, 46, 52, 0.4)" }]}>
        <View style={styles.cardContent}>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.cardTitle, { color: colors.background }]}
          >
            {item.title || item.address || item.category || 'Unknown'}
          </CustomText>
        </View>
      </View>
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
        contentFit="cover"
        priority={isCurrentCard ? "high" : "normal"}
        showLoadingIndicator={true}
        onLoad={handleImageLoad}
        onError={handleImageError}
        borderRadius={16}
      >
        {renderCardContent()}
      </OptimizedImageBackground>
    </Animated.View>
  );
});

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
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    backgroundColor: "transparent",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
