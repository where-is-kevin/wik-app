import React, { ReactNode } from "react";
import { Text, TextProps, TextStyle } from "react-native";

interface CustomTextProps extends TextProps {
  fontFamily?:
    | "Inter-Regular"
    | "Inter-Medium"
    | "Inter-SemiBold"
    | "Inter-Bold";
  children: ReactNode;
}

const fontStyles: Record<string, TextStyle> = {
  "Inter-Regular": { fontFamily: "Inter-Regular" },
  "Inter-Medium": { fontFamily: "Inter-Medium" },
  "Inter-SemiBold": { fontFamily: "Inter-SemiBold" },
  "Inter-Bold": { fontFamily: "Inter-Bold" },
};

const CustomText = ({
  fontFamily = "Inter-Regular",
  style,
  children,
  ...props
}: CustomTextProps) => {
  return (
    <Text style={[fontStyles[fontFamily], style]} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;
