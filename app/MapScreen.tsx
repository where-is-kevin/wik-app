import React from "react";
import { View, StyleSheet, Text } from "react-native";
import MapComponent from "@/components/MapComponent";
import { useRoute } from "@react-navigation/native";

type RouteParams = {
  latitude: number;
  longitude: number;
};

const MapScreen = () => {
  const route = useRoute();
  const { latitude, longitude } = route.params as RouteParams; // Ensure params are typed

  if (!latitude || !longitude) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid location data provided.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapComponent latitude={latitude} longitude={longitude} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default MapScreen;