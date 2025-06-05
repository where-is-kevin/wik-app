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
  onCreateBucket: (bucketName: string) => Promise<void>; // Updated to return Promise
  isLoading?: boolean; // Add loading state prop
}

export const CreateBucketBottomSheet: React.FC<
  CreateBucketBottomSheetProps
> = ({ isVisible, onClose, onCreateBucket, isLoading = false }) => {
  const { colors } = useTheme();
  const [bucketName, setBucketName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBucket = async () => {
    if (bucketName.trim()) {
      setIsCreating(true);
      try {
        await onCreateBucket(bucketName.trim());
        setBucketName(""); // Clear input after successful creation
      } catch (error) {
        console.error("Error creating bucket:", error);
        // You might want to show an error message to the user here
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      // Prevent closing while creating
      setBucketName("");
      onClose();
    }
  };

  const isButtonDisabled = !bucketName.trim() || isCreating || isLoading;

  return (
    <CustomBottomSheet
      isVisible={isVisible}
      onClose={handleClose}
      snapPoints={["60%"]}
      enablePanDownToClose={!isCreating} // Disable pan to close while creating
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
            editable={!isCreating} // Disable input while creating
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
            title={isCreating ? "Creating..." : "Create Bucket"}
            onPress={handleCreateBucket}
            disabled={isButtonDisabled}
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
