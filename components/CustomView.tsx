import React, { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface CustomViewProps extends ViewProps {
  bgColor?: string | null;
  children?: ReactNode;
}

const CustomView = ({
  bgColor,
  style,
  children,
  ...props
}: CustomViewProps) => {
  const { colors } = useTheme();
  const backgroundColor = bgColor !== undefined ? bgColor : colors.background;

  return (
    <View
      style={[backgroundColor !== null && { backgroundColor }, style]}
      {...props}
    >
      {children}
    </View>
  );
};

export default CustomView;
