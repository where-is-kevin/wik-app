import React, { ReactNode } from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  TextStyle,
  Text,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface CustomTouchableProps extends TouchableOpacityProps {
  bgColor?: string | null;
  children?: ReactNode;
}

const CustomTouchable = ({
  bgColor,
  style,
  children,
  ...props
}: CustomTouchableProps) => {
  const { colors } = useTheme();
  const backgroundColor = bgColor !== undefined ? bgColor : colors.background;

  return (
    <TouchableOpacity
      style={[style, backgroundColor !== null && { backgroundColor }]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default CustomTouchable;
