import React, { createContext, useContext, useEffect, ReactNode } from "react";
import RNUxcam from "react-native-ux-cam";
import { AppState } from "react-native";
import Constants from "expo-constants";

interface UXCamContextType {
  logEvent: (eventName: string, properties?: { [key: string]: any }) => void;
  logScreen: (screenName: string) => void;
  setUserId: (userId: string) => void;
  setUserProperty: (key: string, value: string) => void;
}

const UXCamContext = createContext<UXCamContextType | undefined>(undefined);

export const UXCamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    // Get UXCam app key from environment variables
    const uxcamAppKey = Constants.expoConfig?.extra?.uxcamAppKey;

    if (!uxcamAppKey) {
      console.warn("UXCam App Key not found in environment variables");
      return;
    }

    // Initialize UXCam with environment variable
    RNUxcam.startWithConfiguration({
      userAppKey: uxcamAppKey,
    });

    // Enable screen recording
    RNUxcam.optIntoSchematicRecordings();

    // Track app state changes
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        RNUxcam.logEvent("app_opened", {});
      } else if (nextAppState === "background") {
        RNUxcam.logEvent("app_backgrounded", {});
      }
    });

    return () => subscription?.remove();
  }, []);

  const logEvent = (eventName: string, properties?: { [key: string]: any }) => {
    try {
      RNUxcam.logEvent(eventName, properties || {});
    } catch (error) {
      console.error("UXCam error:", error);
    }
  };

  const logScreen = (screenName: string) => {
    try {
      RNUxcam.tagScreenName(screenName);
    } catch (error) {
      console.error("UXCam screen error:", error);
    }
  };

  const setUserId = (userId: string) => {
    try {
      RNUxcam.setUserIdentity(userId);
    } catch (error) {
      console.error("UXCam user ID error:", error);
    }
  };

  const setUserProperty = (key: string, value: string) => {
    try {
      RNUxcam.setUserProperty(key, value);
    } catch (error) {
      console.error("UXCam user property error:", error);
    }
  };

  return (
    <UXCamContext.Provider
      value={{ logEvent, logScreen, setUserId, setUserProperty }}
    >
      {children}
    </UXCamContext.Provider>
  );
};

export const useUXCam = () => {
  const context = useContext(UXCamContext);
  if (!context) {
    throw new Error("useUXCam must be used within UXCamProvider");
  }
  return context;
};
