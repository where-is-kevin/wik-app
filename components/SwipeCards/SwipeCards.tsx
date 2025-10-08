// components/SwipeCards.tsx - Using rn-swiper-list with card stacking fix
import React, { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
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
      onSwipeUp(data[cardIndex]);
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
    (card: CardData) => {
      const imageSource = getImageSource(card.imageUrl);

      return (
        <View style={[
          styles.renderCardContainer,
          fullWidth && { paddingHorizontal: 0 }
        ]}>
          <OptimizedImageBackground
            source={imageSource}
            style={styles.cardStyle}
            contentFit="cover"
            priority="normal"
            showLoadingIndicator={false}
            borderRadius={15}
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
    [colors, onBucketPress, hideButtons, onCardTap, fullWidth]
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

  if (isLoading || !data || data.length === 0) {
    return (
      <View style={styles.container}>
        <AnimatedLoader />
      </View>
    );
  }

  // Handle single card case with prerenderItems workaround for rn-swiper-list bug

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        {!isCompleting && (
          <Swiper
          key={`swiper-${data?.[0]?.id || 'empty'}`}
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
          swipeVelocityThreshold={150}
          prerenderItems={Math.min(data.length - 1, 3)}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          // Configure overlay opacity ranges to make them mutually exclusive - very strict
          inputOverlayLabelRightOpacityRange={[50, 120]}
          outputOverlayLabelRightOpacityRange={[0, 1]}
          inputOverlayLabelLeftOpacityRange={[-120, -50]}
          outputOverlayLabelLeftOpacityRange={[1, 0]}
          inputOverlayLabelTopOpacityRange={[-120, -50]}
          outputOverlayLabelTopOpacityRange={[1, 0]}
          // Enhanced card movement - more realistic pickup animation
          rotateInputRange={[-120, 0, 120]}
          rotateOutputRange={[-Math.PI / 8, 0, Math.PI / 8]}
          translateYRange={[-15, 0, -15]}
          // prerenderItems={1}
          swipeRightSpringConfig={{
            damping: 50,
            stiffness: 400,
            mass: 0.3,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          }}
          swipeLeftSpringConfig={{
            damping: 50,
            stiffness: 400,
            mass: 0.3,
            overshootClamping: true,
            restDisplacementThreshold: 0.01,
            restSpeedThreshold: 0.01,
          }}
          swipeTopSpringConfig={{
            damping: 50,
            stiffness: 400,
            mass: 0.3,
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
      </View>
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
