// CreateBucketBottomSheet.tsx
import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import { CustomBottomSheet } from "./CustomBottomSheet";
import CustomButton from "../Button/CustomButton";
import CustomTextInput from "../TextInput/CustomTextInput";
import NextButton from "../Button/NextButton";

interface CreateBucketBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onCreateBucket: (bucketName: string) => void;
}

export const CreateBucketBottomSheet: React.FC<
  CreateBucketBottomSheetProps
> = ({ isVisible, onClose, onCreateBucket }) => {
  const { colors } = useTheme();
  const [bucketName, setBucketName] = useState("");

  const handleCreateBucket = () => {
    if (bucketName.trim()) {
      onCreateBucket(bucketName.trim());
      setBucketName("");
    }
  };

  const handleClose = () => {
    setBucketName("");
    onClose();
  };

  return (
    <CustomBottomSheet
      isVisible={isVisible}
      onClose={handleClose}
      snapPoints={["60%"]}
      enablePanDownToClose={true}
    >
      <CustomView style={styles.container}>
        <CustomView style={styles.header}>
          <CustomText
            fontFamily="Inter-SemiBold"
            style={[styles.title, { color: colors.label_dark }]}
          >
            Create bucket
          </CustomText>
        </CustomView>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <CustomTextInput
            label="Name"
            value={bucketName}
            onChangeText={setBucketName}
            placeholder="Enter bucket name..."
            autoCapitalize="words"
          />
        </ScrollView>

        {/* Fixed bottom section for Create Button */}
        <CustomView
          style={[
            styles.bottomSection,
            { borderTopColor: colors.onboarding_gray },
          ]}
        >
          <NextButton
            title="Create Bucket"
            onPress={handleCreateBucket}
            disabled={!bucketName.trim()}
            bgColor={colors.lime}
          />
        </CustomView>
      </CustomView>
    </CustomBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: verticalScale(4),
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: scaleFontSize(16),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  bottomSection: {
    paddingBottom: verticalScale(12),
    paddingHorizontal: 24,
  },
});
