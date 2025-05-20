import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "../../utilities/scaling";
import CustomText from "../CustomText";
import CustomView from "../CustomView";

interface CustomButtonProps {
  title: string;
  isLoading?: boolean;
  onPress: () => void;
  customStyles?: object;
  customStylesText?: object;
  children?: React.ReactNode;
  disabled?: boolean | null;
  customInnerStyles?: object;
  customStylesDisabled?: object;
  fontFamily?:
    | "Inter-Regular"
    | "Inter-Medium"
    | "Inter-SemiBold"
    | "Inter-Bold";
}

const CustomButton = ({
  title,
  onPress,
  customStyles,
  customStylesText,
  children,
  disabled,
  customInnerStyles,
  fontFamily = "Inter-Medium",
}: CustomButtonProps) => {
  const onButtonPressed = () => {
    if (!disabled) {
      onPress?.();
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onButtonPressed}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed ? 0.6 : 1,
        },
        customStyles,
        disabled && styles.buttonDisabled,
      ]}
    >
      <CustomView style={[styles.containerInner, customInnerStyles]}>
        {children}
        <CustomText
          style={[
            styles.buttonText,
            customStylesText,
            disabled && styles.disabledText,
          ]}
          fontFamily={fontFamily}
        >
          {title}
        </CustomText>
      </CustomView>
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(16),
  },
  buttonText: {
    color: "#F6F7F9",
    fontSize: scaleFontSize(14),
    textAlign: "center",
  },
  containerInner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#EDEEF1",
  },
  disabledText: {
    color: "#637083",
  },
});
