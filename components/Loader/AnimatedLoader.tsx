import React from "react";
import CustomView from "../CustomView";
import LottieView from "lottie-react-native";
import { StyleSheet } from "react-native";

const AnimatedLoader = () => {
  return (
    <CustomView style={styles.container}>
      <LottieView
        source={require("@/assets/animations/kevin-loader.lottie")}
        autoPlay
        loop
        style={styles.animation}
      />
    </CustomView>
  );
};

export default AnimatedLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 120,
    height: 120,
  },
});
