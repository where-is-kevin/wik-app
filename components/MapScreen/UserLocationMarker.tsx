import React from "react";
import { View, StyleSheet, Platform, Text } from "react-native";

interface UserLocationMarkerProps {
  size?: number;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ size = 30 }) => {
  // Make larger on Android for better visibility
  const adjustedSize = Platform.OS === 'android' ? size * 1.3 : size;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, { fontSize: adjustedSize }]}>📍</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    textAlign: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        elevation: 2,
      },
    }),
  },
});

export default UserLocationMarker;