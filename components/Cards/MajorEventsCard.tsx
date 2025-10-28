import React from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import { HeartButton } from "../HeartButton/HeartButton";
import { OptimizedImageBackground } from "../OptimizedImage/OptimizedImage";

export interface MajorEventData {
  id: string;
  title: string;
  location: string;
  dateRange: string;
  eventCount?: string;
  imageUrl?: string;
  isLiked?: boolean;
}

interface MajorEventsCardProps {
  event: MajorEventData;
  onPress: (event: MajorEventData) => void;
  onLikePress?: (event: MajorEventData) => void;
  style?: any;
  hasTabBar?: boolean;
}

export const MajorEventsCard: React.FC<MajorEventsCardProps> = ({
  event,
  onPress,
  onLikePress,
  style,
  hasTabBar = true,
}) => {
  const { colors } = useTheme();

  const handleLikePress = () => {
    if (onLikePress) {
      onLikePress(event);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(event)}
      activeOpacity={0.8}
    >
      <OptimizedImageBackground
        source={event.imageUrl ? { uri: event.imageUrl } : ""}
        style={styles.backgroundImage}
        contentFit="cover"
        borderRadius={8}
        showLoadingIndicator={true}
        showErrorFallback={true}
      >
        {/* Heart icon */}
        {onLikePress && (
          <View style={styles.heartContainer}>
            <HeartButton
              isLiked={event.isLiked || false}
              onPress={handleLikePress}
              size={25}
              color={colors.lime}
              hasTabBar={hasTabBar}
            />
          </View>
        )}

        {/* Linear gradient overlay */}
        <LinearGradient
          colors={[
            "rgba(242, 242, 243, 0)",
            "rgba(130, 130, 131, 0.5)",
            "rgba(75, 75, 76, 0.7)",
            "#131314",
          ]}
          locations={[0, 0.25, 0.5, 0.9]}
          style={styles.gradientOverlay}
        >
          <View style={styles.contentContainer}>
            {/* Date range */}
            <CustomText style={[styles.dateText, { color: colors.text_white }]}>
              {event.dateRange}
            </CustomText>

            {/* Event title */}
            <CustomText
              fontFamily="Inter-Bold"
              style={[styles.titleText, { color: colors.text_white }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {event.title || event.location || "Event"}
            </CustomText>

            {/* Location and count */}
            <CustomText
              style={[styles.locationText, { color: colors.text_white }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {event.location && event.location.trim() !== ""
                ? `${event.location} ${
                    event.eventCount ? `• ${event.eventCount}` : ""
                  }`
                : event.eventCount || ""}
            </CustomText>
          </View>
        </LinearGradient>
      </OptimizedImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: horizontalScale(240),
    height: verticalScale(120),
    marginRight: horizontalScale(10),
    borderRadius: 8,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android: NO elevation to prevent white flash with shimmer
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "flex-end",
    borderRadius: 8,
    overflow: "hidden",
  },
  imageStyle: {
    borderRadius: 8,
  },
  heartContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  contentContainer: {
    // Content container for text
  },
  dateText: {
    fontSize: scaleFontSize(12),
    lineHeight: 21,
  },
  titleText: {
    fontSize: scaleFontSize(20),
    lineHeight: 21,
  },
  locationText: {
    fontSize: scaleFontSize(16),
    lineHeight: 21,
  },
});
