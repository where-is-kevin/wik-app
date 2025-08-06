import React from "react";
import { View, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import { scaleFontSize } from "@/utilities/scaling";

interface ClusterMarkerProps {
  count: number;
  onPress: () => void;
}

const ClusterMarker: React.FC<ClusterMarkerProps> = ({ count, onPress }) => {
  const { colors } = useTheme();

  const getClusterSize = (count: number) => {
    if (count < 10) return 40;
    if (count < 50) return 50;
    if (count < 100) return 60;
    return 70;
  };

  const size = getClusterSize(count);

  return (
    <View
      style={[
        styles.cluster,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.lime,
          borderColor: colors.label_dark,
        },
      ]}
    >
      <CustomText
        style={[
          styles.clusterText,
          { 
            color: colors.label_dark,
            fontSize: scaleFontSize(count < 100 ? 14 : 12),
          }
        ]}
        fontFamily="Inter-Bold"
      >
        {count}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  cluster: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  clusterText: {
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ClusterMarker;