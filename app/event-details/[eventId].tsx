import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  View,
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
import SendSvgSmall from "@/components/SvgComponents/SendSvgSmall";
import CustomView from "@/components/CustomView";
import MoreSvg from "@/components/SvgComponents/MoreSvg";
import BucketSvg from "@/components/SvgComponents/BucketSvg";
import ShareButton from "@/components/Button/ShareButton";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

interface EventDetailsScreenProps {}

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Estimated header height - adjusted based on your setup
  const ESTIMATED_HEADER_HEIGHT = verticalScale(10) + 12 + 24;
  // Panel heights
  const PANEL_MIN_HEIGHT = SCREEN_HEIGHT * 0.3;
  const PANEL_MAX_HEIGHT = SCREEN_HEIGHT - insets.top - ESTIMATED_HEADER_HEIGHT;

  const panelHeight = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);

  // Get the event details from params
  const eventId = params.eventId as string;
  const title = (params.title as string) || "Winery Erdevik";
  const description = (params.description as string) || "Winery Erdevik";
  const imageUrl = params.imageUrl as string;
  const price = (params.price as string) || "£45";

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

  return (
    <CustomView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground source={TestImage} style={styles.backgroundImage}>
        <SafeAreaView
          style={[styles.headerContainer, { backgroundColor: colors.overlay }]}
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
                  EXPERIENCE
                </CustomText>
              </CustomView>

              {/* Share Button */}
              <CustomView style={styles.row}>
                <CustomTouchable
                  style={styles.bucketContainer}
                  bgColor={colors.label_dark}
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
                    title={title || ""}
                    message={`Check out this bucket: ${title}`}
                    url={"www.google.com"}
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
                {title}
              </CustomText>
              {/* Price Info */}
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.priceText, { color: colors.event_gray }]}
              >
                {price}{" "}
                <CustomText
                  fontFamily="Inter-SemiBold"
                  style={[styles.perPersonText, { color: colors.event_gray }]}
                >
                  /person
                </CustomText>
              </CustomText>

              {/* Address */}
              <CustomText
                fontFamily="Inter-SemiBold"
                style={[styles.addressText, { color: colors.label_dark }]}
              >
                Address
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem
                at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
                mauris. Fusce nec tellus sed augue semper porta.
              </CustomText>
            </CustomView>
          </CustomView>
        </ScrollView>
      </Animated.View>
    </CustomView>
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
  titleSection: {},
  title: {
    fontSize: scaleFontSize(24),
  },
  priceText: {
    fontSize: scaleFontSize(24),
    marginBottom: verticalScale(4),
  },
  perPersonText: {
    fontSize: scaleFontSize(12),
  },
  addressText: {
    fontSize: scaleFontSize(14),
  },
  aboutSection: {
    marginTop: verticalScale(16),
  },
  aboutTitle: {
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(8),
  },
  aboutText: {
    fontSize: scaleFontSize(14),
    lineHeight: 16,
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
});

export default EventDetailsScreen;
