import React from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";
import CustomView from "../CustomView";
import AddImageSvg from "../SvgComponents/AddImageSvg";
import { useTheme } from "@/contexts/ThemeContext";
import { verticalScale } from "@/utilities/scaling";

interface AddImageButtonProps {
  onPress: () => void;
  imageUri: string | null;
}

const AddImageButton: React.FC<AddImageButtonProps> = ({
  onPress,
  imageUri,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress}>
      <CustomView bgColor={colors.onboarding_gray} style={styles.image}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <AddImageSvg />
        )}
      </CustomView>
    </TouchableOpacity>
  );
};

export default AddImageButton;

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
});
