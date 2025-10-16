import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";
import BackHeader from "@/components/Header/BackHeader";
import CustomView from "@/components/CustomView";
import AnimatedLoader from "@/components/Loader/AnimatedLoader";

const PrivacyPolicyScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <AnimatedLoader />
    </View>
  );

  return (
    <>
      <StatusBar style="dark" translucent />
      <CustomView
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: colors?.background || "#F8F9FA",
          },
        ]}
      >
        <BackHeader title="Privacy Policy" transparent={true} />

        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: "https://whereiskevin.com/privacy" }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => <LoadingIndicator />}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            mixedContentMode="compatibility"
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView error: ", nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView HTTP error: ", nativeEvent);
            }}
          />
        </View>
      </CustomView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    // marginHorizontal: 16,
    marginBottom: 16,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

export default PrivacyPolicyScreen;
