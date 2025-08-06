import React from "react";
import { View, StyleSheet } from "react-native";

interface UserLocationMarkerProps {
  size?: number;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ size = 32 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer pulse circle */}
      <View style={[styles.pulseCircle, { width: size, height: size }]} />
      {/* Middle circle */}
      <View style={[styles.middleCircle, { 
        width: size * 0.65, 
        height: size * 0.65,
        borderRadius: (size * 0.65) / 2,
      }]} />
      {/* Inner dot */}
      <View style={[styles.innerDot, { 
        width: size * 0.35, 
        height: size * 0.35,
        borderRadius: (size * 0.35) / 2,
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    backgroundColor: "rgba(66, 165, 245, 0.2)",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(66, 165, 245, 0.4)",
    position: "absolute",
  },
  middleCircle: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#42A5F5",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  innerDot: {
    backgroundColor: "#1976D2",
    position: "absolute",
  },
});

export default UserLocationMarker;