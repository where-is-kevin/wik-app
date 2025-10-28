// CreateBucketBottomSheet.tsx
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { StyleSheet } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native";
import BucketNameInput from "./BucketNameInput";
import SheetHeader from "./SheetHeader";
import CreateButton from "./CreateButton";

interface CreateBucketBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onCreateBucket: (bucketName: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateBucketBottomSheetComponent: React.FC<
  CreateBucketBottomSheetProps
> = ({ isVisible, onClose, onCreateBucket, isLoading = false }) => {
  const [isCreating, setIsCreating] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  // Memoized backdrop component
  const renderBackdrop = useMemo(
    () => (props: any) =>
      (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
    []
  );

  // Memoized handlers
  const handleCreateBucket = useCallback(async () => {
    const text = textRef.current;
    if (text.trim()) {
      setIsCreating(true);
      try {
        await onCreateBucket(text.trim());
        textRef.current = "";
        setHasText(false);

        // Immediate closing - let the parent handle the timing
        setIsCreating(false);
        onClose(); // Close the bottom sheet immediately
      } catch (error: any) {
        console.error("Error creating bucket:", error);
        setIsCreating(false);
      }
    }
  }, [onCreateBucket, onClose]);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      textRef.current = "";
      setHasText(false);
      onClose();
    }
  }, [isCreating, onClose]);

  // CRITICAL: Use a ref to track text without causing re-renders
  const textRef = useRef("");
  const [hasText, setHasText] = useState(false);

  const handleTextChange = useCallback(
    (text: string) => {
      textRef.current = text;
      // Only update boolean for button state, not the full text
      const hasTextNow = text.trim().length > 0;
      if (hasTextNow !== hasText) {
        setHasText(hasTextNow);
      }
    },
    [hasText]
  );

  // Memoized disabled state - uses boolean instead of text
  const isButtonDisabled = useMemo(() => {
    return !hasText || isCreating || isLoading;
  }, [hasText, isCreating, isLoading]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={["60%"]}
      onDismiss={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: "#fff",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
      }}
      handleIndicatorStyle={{ backgroundColor: "#F2F2F7" }}
      enablePanDownToClose={!isCreating}
      enableDismissOnClose={true}
      enableDynamicSizing={false}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      animateOnMount={false}
      enableContentPanningGesture={false}
      enableOverDrag={false}
      overDragResistanceFactor={0}
    >
      <BottomSheetView style={styles.container}>
        <SheetHeader title="Create bucket" />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BucketNameInput
            onTextChange={handleTextChange}
            disabled={isCreating}
          />
        </ScrollView>

        <CreateButton
          disabled={isButtonDisabled}
          isCreating={isCreating}
          onPress={handleCreateBucket}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
});

export const CreateBucketBottomSheet = React.memo(
  CreateBucketBottomSheetComponent,
  (prevProps, nextProps) => {
    // Only re-render if meaningful props have changed
    return (
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);

CreateBucketBottomSheet.displayName = "CreateBucketBottomSheet";
