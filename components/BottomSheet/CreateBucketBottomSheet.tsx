// CreateBucketBottomSheet.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import { scaleFontSize, verticalScale } from "@/utilities/scaling";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native";
import CustomTextInput from "../TextInput/CustomTextInput";
import NextButton from "../Button/NextButton";

interface CreateBucketBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onCreateBucket: (bucketName: string) => Promise<void>; // Updated to return Promise
  isLoading?: boolean; // Add loading state prop
}

const CreateBucketBottomSheetComponent: React.FC<
  CreateBucketBottomSheetProps
> = ({ isVisible, onClose, onCreateBucket, isLoading = false }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [bucketName, setBucketName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Bottom sheet ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  // Render backdrop callback
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const handleCreateBucket = useCallback(async () => {
    if (bucketName.trim()) {
      setIsCreating(true);
      try {
        await onCreateBucket(bucketName.trim());
        setBucketName(""); // Clear input after successful creation
        // Small delay to ensure state updates complete before parent closes modal
        setTimeout(() => {
          setIsCreating(false);
        }, 100);
      } catch (error) {
        console.error("Error creating bucket:", error);
        setIsCreating(false);
        // You might want to show an error message to the user here
      }
    }
  }, [bucketName, onCreateBucket]);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      // Prevent closing while creating
      setBucketName("");
      onClose();
    }
  }, [isCreating, onClose]);

  const handleTextChange = useCallback((text: string) => {
    setBucketName(text);
  }, []);

  const isButtonDisabled = !bucketName.trim() || isCreating || isLoading;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={["70%"]}
      onDismiss={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.indicator_gray || "#F2F2F7",
      }}
      enablePanDownToClose={!isCreating} // Disable pan to close while creating
      enableDismissOnClose={true}
      enableDynamicSizing={false}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
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
          keyboardShouldPersistTaps="handled"
        >
          <CustomTextInput
            label="Name"
            value={bucketName}
            onChangeText={handleTextChange}
            placeholder="Enter bucket name..."
            autoCapitalize="words"
            editable={!isCreating} // Disable input while creating
            autoFocus={false}
            blurOnSubmit={true}
            returnKeyType="done"
          />
        </ScrollView>

        {/* Fixed bottom section for Create Button */}
        <CustomView
          style={[
            styles.bottomSection,
            {
              borderTopColor: colors.onboarding_gray,
              paddingBottom: insets.bottom + 12, // Add 12pt base + safe area
            },
          ]}
        >
          <NextButton
            title={isCreating ? "Creating..." : "Create Bucket"}
            onPress={handleCreateBucket}
            disabled={isButtonDisabled}
            bgColor={colors.lime}
          />
        </CustomView>
      </BottomSheetView>
    </BottomSheetModal>
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

export const CreateBucketBottomSheet = React.memo(CreateBucketBottomSheetComponent);
