import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  View,
} from "react-native";
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

export interface LocalEventData {
  id: string;
  title: string;
  time: string;
  venue: string;
  imageUrl: string;
  isLiked?: boolean;
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
      <LinearGradient
        colors={["#CCFF3A", "#01DB87", "#3C62FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      >
        <View
          style={[styles.backgroundGradient, { backgroundColor: "#0B2E34" }]}
        >
          {/* Heart button */}
          {onLikePress && (
            <View style={styles.heartContainer}>
              <HeartButton
                isLiked={event.isLiked || false}
                onPress={handleLikePress}
                size={24}
                color={colors.lime}
                hasTabBar={hasTabBar}
              />
            </View>
          )}

          <View style={styles.content}>
            {/* Event Image */}
            <ImageBackground
              source={{ uri: event.imageUrl }}
              style={styles.image}
              imageStyle={styles.imageStyle}
            />

            {/* Event Info */}
            <View style={styles.info}>
              <CustomText
                fontFamily="Inter-Bold"
                style={[styles.title, { color: colors.text_white }]}
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
                    color={colors.text_white}
                  />
                  <CustomText
                    style={[styles.detailText, { color: colors.text_white }]}
                  >
                    {event.time}
                  </CustomText>
                </View>

                {/* Venue row */}
                <View style={styles.detailRow}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.text_white}
                  />
                  <CustomText
                    style={[styles.detailText, { color: colors.text_white }]}
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
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  borderGradient: {
    flex: 1,
    padding: 2,
    borderRadius: 12,
  },
  backgroundGradient: {
    flex: 1,
    borderRadius: 10,
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
  imageStyle: {
    borderRadius: 5,
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
