import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the colors
const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

// Define color types
type ThemeColors = {
  text: string;
  gray_regular: string;
  label_dark: string;
  focus_input: string;
  link_blue: string;
  lime: string;
  horizontal_line: string;
  border_gray: string;
  background: string;
  overlay: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  buttonText: string;
  onboarding_gray: string;
  onboarding_option_dark: string;
  onboarding_option_white: string;
  input_border: string;
  card_purple: string;
  event_gray: string;
};

// Define the themes
const themes = {
  light: {
    text: "#11181C",
    gray_regular: "#6F6F76",
    label_dark: "#131314",
    focus_input: "#4D4DFF",
    link_blue: "#493CFA",
    lime: "#CCFF3A",
    horizontal_line: "#6F6F76",
    border_gray: "#E5E5E6",
    onboarding_gray: "#F2F2F3",
    onboarding_option_dark: "#4A4A4F",
    onboarding_option_white: "#FFF",
    input_border: "#D6D6D9",
    card_purple: "#2D51FF",
    background: "#fff",
    overlay: "rgba(0,0,0,0)",
    event_gray: "#A3A3A8",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    buttonText: "#fff",
  },
  dark: {
    text: "#ECEDEE",
    gray_regular: "#6F6F76",
    label_dark: "#131314",
    focus_input: "#4D4DFF",
    link_blue: "#493CFA",
    lime: "#CCFF3A",
    horizontal_line: "#6F6F76",
    border_gray: "#E5E5E6",
    onboarding_gray: "#F2F2F3",
    onboarding_option_dark: "#4A4A4F",
    onboarding_option_white: "#FFF",
    input_border: "#D6D6D9",
    card_purple: "#2D51FF",
    background: "#151718",
    overlay: "rgba(0,0,0,0)",
    event_gray: "#A3A3A8",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    buttonText: "#151718",
  },
};

// Storage key
const THEME_KEY = "@app_theme";

// Define the context type
type ThemeContextType = {
  colors: ThemeColors;
  toggleTheme: () => void;
  statusBarStyle: "light" | "dark";
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  colors: themes.light,
  toggleTheme: () => {},
  statusBarStyle: "dark",
});

// Define props for ThemeProvider
type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // State for current theme ('light' or 'dark')
  const [isDark, setIsDark] = useState(false);

  // Load saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme === "dark") {
          setIsDark(true);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };

    loadTheme();
  }, []);

  // Get current colors based on theme
  const colors = isDark ? themes.dark : themes.light;

  // Toggle between light and dark themes
  const toggleTheme = async () => {
    const newIsDark = !isDark;
    try {
      await AsyncStorage.setItem(THEME_KEY, newIsDark ? "dark" : "light");
      setIsDark(newIsDark);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Define status bar style based on current theme
  const statusBarStyle = isDark ? "light" : "dark";

  return (
    <ThemeContext.Provider
      value={{
        colors,
        toggleTheme,
        statusBarStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme
export const useTheme = () => useContext(ThemeContext);
