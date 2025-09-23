import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "@/components/CustomText";
import BackSvg from "@/components/SvgComponents/BackSvg";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

interface HeaderWithIconsProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showMapIcon?: boolean;
  showSearchIcon?: boolean;
  onMapPress?: () => void;
  onSearchPress?: () => void;
  backgroundColor?: string;
  style?: any;
}

export const HeaderWithIcons: React.FC<HeaderWithIconsProps> = ({
  title,
  subtitle,
  onBackPress,
  showMapIcon = true,
  showSearchIcon = true,
  onMapPress,
  onSearchPress,
  backgroundColor = "#fff",
  style,
}) => {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + verticalScale(6),
          backgroundColor,
        },
        style,
      ]}
    >
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <BackSvg stroke={colors.light_blue} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        {subtitle && (
          <CustomText
            style={[styles.headerSubtitle, { color: colors.gray_regular }]}
          >
            {subtitle}
          </CustomText>
        )}
        <CustomText
          fontFamily="Inter-Bold"
          style={[styles.headerTitle, { color: colors.label_dark }]}
        >
          {title}
        </CustomText>
      </View>

      <View style={styles.headerIcons}>
        {showMapIcon && (
          <TouchableOpacity onPress={onMapPress} style={styles.iconButton}>
            <Ionicons name="map-outline" size={25} color={colors.light_blue} />
          </TouchableOpacity>
        )}
        {showSearchIcon && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <Ionicons name="search" size={25} color={colors.light_blue} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    paddingBottom: 8,
  },
  backButton: {
    width: horizontalScale(40),
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: scaleFontSize(16),
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
  },
  headerIcons: {
    flexDirection: "row",
    gap: horizontalScale(15),
    width: horizontalScale(40),
    justifyContent: "flex-end",
  },
  iconButton: {},
});