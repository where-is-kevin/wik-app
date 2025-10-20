import React from "react";
import { StyleSheet, TouchableOpacity, ImageBackground, View } from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import {
  horizontalScale,
  verticalScale,
  scaleFontSize,
} from "@/utilities/scaling";

export interface CityData {
  id: string;
  name: string;
  imageUrl: string;
}

interface CityCardProps {
  city: CityData;
  onPress: (city: CityData) => void;
  style?: any;
}

export const CityCard: React.FC<CityCardProps> = ({
  city,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(city)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: city.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.00)", "#0B2E34"]}
          locations={[0, 1]}
          style={styles.gradient}
        >
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.cityName, { color: "#fff" }]}
          >
            {city.name}
          </CustomText>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 145,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: horizontalScale(12),
  },
  imageBackground: {
    flex: 1,
  },
  image: {
    borderRadius: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: horizontalScale(12),
    borderRadius: 8,
  },
  cityName: {
    fontSize: scaleFontSize(14),
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});