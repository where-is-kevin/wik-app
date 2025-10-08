// contexts/ModeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type Mode = "leisure" | "business";

type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = "user_mode_preference";

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<Mode>("leisure");

  // Load saved mode on app start
  useEffect(() => {
    const loadSavedMode = async () => {
      try {
        const savedMode = await SecureStore.getItemAsync(MODE_STORAGE_KEY);
        if (savedMode === "business" || savedMode === "leisure") {
          setMode(savedMode);
        }
      } catch (error) {
        // If unable to load, keep default "leisure"
        console.log("Could not load saved mode preference:", error);
      }
    };

    loadSavedMode();
  }, []);

  // Save mode when it changes - let React Query handle refetching naturally
  const setModeAndSave = async (newMode: Mode) => {
    // Update mode state immediately for UI responsiveness
    setMode(newMode);

    try {
      await SecureStore.setItemAsync(MODE_STORAGE_KEY, newMode);
    } catch (error) {
      console.log("Could not save mode preference:", error);
    }

    // Note: No manual query invalidation needed - React Query will automatically
    // refetch when locationParams changes due to the new mode value
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: setModeAndSave }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
