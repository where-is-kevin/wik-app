import React from "react";
import { View, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import OptimizedImage from "@/components/OptimizedImage/OptimizedImage";
import { useTheme } from "@/contexts/ThemeContext";
import { verticalScale, horizontalScale, scaleFontSize } from "@/utilities/scaling";

interface HostSectionProps {
  host?: {
    name: string;
    image: string;
  };
}

export const HostSection: React.FC<HostSectionProps> = ({ host }) => {
  const { colors } = useTheme();

  if (!host || (!host.name && !host.image)) return null;

  return (
    <CustomView style={styles.section}>
      <CustomText
        fontFamily="Inter-SemiBold"
        style={[styles.sectionTitle, { color: colors.label_dark }]}
      >
        Host
      </CustomText>
      <View style={styles.sectionDivider} />
      <View style={styles.hostContainer}>
        <View style={styles.hostAvatar}>
          <OptimizedImage
            source={{ uri: host.image }}
            style={styles.hostAvatarImage}
            contentFit="cover"
            priority="normal"
            showLoadingIndicator={false}
            showErrorFallback={true}
          />
        </View>
        <CustomText style={[styles.hostName, { color: colors.label_dark }]}>
          {host.name || "Unknown Host"}
        </CustomText>
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
  hostContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(12),
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  hostAvatarImage: {
    width: "100%",
    height: "100%",
  },
  hostName: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
});