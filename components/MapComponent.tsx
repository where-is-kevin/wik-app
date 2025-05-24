import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type MapComponentProps = {
  latitude: number;
  longitude: number;
};

const MapComponent = ({ latitude, longitude }: MapComponentProps) => {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      googleMapId="e698a3c123c9505aefccc855"
      initialRegion={{
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  webFallbackText: {
    fontSize: 16,
    color: "#333",
  },
});

export default MapComponent;