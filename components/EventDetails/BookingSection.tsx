import React from "react";
import { View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import { useTheme } from "@/contexts/ThemeContext";
import {
  verticalScale,
  horizontalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface BookingSectionProps {
  websiteUrl?: string | null;
  phone?: string | null;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  websiteUrl,
  phone,
}) => {
  const { colors } = useTheme();

  if (!websiteUrl && !phone) return null;

  return (
    <CustomView style={styles.section}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.sectionTitle, { color: colors.label_dark }]}
      >
        Booking
      </CustomText>
      <View style={styles.sectionDivider} />
      <View style={styles.bookingContainer}>
        {websiteUrl && (
          <TouchableOpacity
            onPress={() => Linking.openURL(websiteUrl)}
            style={styles.bookingItem}
          >
            <View style={styles.bookingRow}>
              <Ionicons
                name="link-outline"
                size={24}
                color={colors.event_gray}
                style={styles.bookingIcon}
              />
              <CustomText
                style={[styles.bookingLink, { color: colors.light_blue }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {websiteUrl}
              </CustomText>
            </View>
          </TouchableOpacity>
        )}
        {phone && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${phone}`)}
            style={styles.bookingItem}
          >
            <View style={styles.bookingRow}>
              <Ionicons
                name="call-outline"
                size={23}
                color={colors.event_gray}
                style={styles.bookingIcon}
              />
              <CustomText
                style={[styles.bookingLink, { color: colors.light_blue }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {phone}
              </CustomText>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: verticalScale(16),
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: "#D6D6D9",
    marginTop: verticalScale(10),
    marginBottom: verticalScale(14),
  },
  sectionTitle: {
    fontSize: scaleFontSize(14),
  },
  bookingContainer: {
    gap: verticalScale(8),
  },
  bookingItem: {},
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingIcon: {
    marginRight: horizontalScale(8),
  },
  bookingLink: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
});
