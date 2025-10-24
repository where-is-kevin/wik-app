import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomText from "../CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";
import { Ionicons } from "@expo/vector-icons";
import { HeartButton } from "../HeartButton/HeartButton";
import { OptimizedImageBackground } from "../OptimizedImage/OptimizedImage";

export interface LocalEventData {
  id: string;
  title: string;
  time: string;
  venue: string;
  imageUrl?: string;
  isLiked?: boolean;
  date?: string; // Raw ISO date for grouping
}

interface LocalEventCardProps {
  event: LocalEventData;
  onPress: (event: LocalEventData) => void;
  onLikePress?: (event: LocalEventData) => void;
  style?: any;
  hasTabBar?: boolean;
}

export const LocalEventCard: React.FC<LocalEventCardProps> = ({
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
      <View style={styles.cardContainer}>
        {/* Heart button */}
        {onLikePress && (
          <View style={styles.heartContainer}>
            <HeartButton
              isLiked={event.isLiked || false}
              onPress={handleLikePress}
              size={24}
              color={colors.lime}
              hasTabBar={hasTabBar}
              useCustomSvg={true}
            />
          </View>
        )}

        <View style={styles.content}>
          {/* Event Image */}
          <OptimizedImageBackground
            source={event.imageUrl ? { uri: event.imageUrl } : ""}
            style={styles.image}
            contentFit="cover"
            borderRadius={5}
            showLoadingIndicator={true}
            showErrorFallback={true}
          />

          {/* Event Info */}
          <View style={styles.info}>
            <CustomText
              fontFamily="Inter-Bold"
              style={[styles.title, { color: colors.label_dark }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {event.title}
            </CustomText>

            <View style={styles.details}>
              {/* Time row */}
              <View style={styles.detailRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.horizontal_line}
                />
                <CustomText
                  style={[styles.detailText, { color: colors.horizontal_line }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {event.time}
                </CustomText>
              </View>

              {/* Venue row */}
              <View style={styles.detailRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={colors.horizontal_line}
                />
                <CustomText
                  style={[styles.detailText, { color: colors.horizontal_line }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {event.venue}
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: "hidden",
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#F2F2F3",
  },
  heartContainer: {
    position: "absolute",
    top: 15,
    right: 10,
    zIndex: 10,
  },
  content: {
    flexDirection: "row",
    flex: 1,
    paddingLeft: horizontalScale(10),
    paddingVertical: verticalScale(15),
    gap: 15,
  },
  image: {
    width: 63,
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  info: {
    flex: 1,
    paddingRight: horizontalScale(40), // Leave space for heart button
  },
  title: {
    fontSize: scaleFontSize(16),
    marginBottom: verticalScale(8),
  },
  details: {
    gap: verticalScale(5.5),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  detailText: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
});
