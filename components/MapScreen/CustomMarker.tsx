import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize } from "@/utilities/scaling";

interface CustomMarkerProps {
  similarity: number;
  icon: React.ComponentType<any>; // SVG Component
  color: "bordo" | "profile_name_black" | "venue_orange"; // use keys from theme
  isSelected: boolean;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({
  similarity,
  icon: IconComponent,
  color,
  isSelected,
}) => {
  const { colors } = useTheme();
  const backgroundColor = isSelected ? colors[color] : "#FFFFFF";
  const textColor = isSelected ? "#FFFFFF" : colors[color];
  const borderColor = isSelected ? "transparent" : colors[color];

  return (
    <View style={[styles.shadow]}>
      <View
        style={[
          styles.markerContainer,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isSelected ? "#FFFFFF" : colors[color] },
          ]}
        >
          <IconComponent
            width={17}
            height={17}
            stroke={isSelected ? colors[color] : "#FFFFFF"}
            fill={isSelected ? colors[color] : "#FFFFFF"}
          />
        </View>
        <CustomText
          fontFamily="Inter-SemiBold"
          style={[styles.text, { color: textColor }]}
        >
          {similarity}%
        </CustomText>
      </View>
    </View>
  );
};

export default CustomMarker;

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#131314",
        shadowOffset: { width: 1, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
        shadowColor: "#131314",
      },
    }),
    borderRadius: 50,
    alignSelf: "flex-start",
  },
  markerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingRight: 12,
    paddingLeft: 6,
    borderRadius: 50,
    borderWidth: 1.5,
    gap: 6,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 66.506,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: scaleFontSize(12),
  },
});
