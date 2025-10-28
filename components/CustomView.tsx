import React, { ReactNode, memo } from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface CustomViewProps extends ViewProps {
  bgColor?: string | null;
  children?: ReactNode;
}

const CustomView = memo<CustomViewProps>(({
  bgColor,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const finalStyle = React.useMemo(() => {
    const backgroundColor = bgColor !== undefined ? bgColor : colors.background;
    return [backgroundColor !== null && { backgroundColor }, style];
  }, [bgColor, colors.background, style]);

  return (
    <View
      style={finalStyle}
      {...props}
    >
      {children}
    </View>
  );
}, (prevProps, nextProps) => {
  // Strict equality check for better performance
  return (
    prevProps.bgColor === nextProps.bgColor &&
    prevProps.style === nextProps.style &&
    prevProps.children === nextProps.children
  );
});

export default CustomView;
