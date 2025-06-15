// CustomBottomSheet.tsx
import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, StyleSheet, Pressable, Animated, Keyboard } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@/contexts/ThemeContext";

export interface CustomBottomSheetRef {
  expand: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

interface CustomBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: string[];
  enablePanDownToClose?: boolean;
  backgroundStyle?: object;
  handleIndicatorStyle?: object;
  overlayOpacity?: number;
  animationDuration?: number;
}

export const CustomBottomSheet = forwardRef<
  CustomBottomSheetRef,
  CustomBottomSheetProps
>(
  (
    {
      isVisible,
      onClose,
      children,
      snapPoints = ["70%"],
      enablePanDownToClose = true,
      backgroundStyle,
      handleIndicatorStyle,
      overlayOpacity = 0.5,
      animationDuration = 250,
    },
    ref
  ) => {
    const { colors } = useTheme();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const overlayAnimatedValue = useRef(new Animated.Value(0)).current;

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
      snapToIndex: (index: number) =>
        bottomSheetRef.current?.snapToIndex(index),
    }));

    useEffect(() => {
      if (isVisible) {
        bottomSheetRef.current?.expand();
        // Animate overlay in
        Animated.timing(overlayAnimatedValue, {
          toValue: overlayOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }).start();
      } else {
        bottomSheetRef.current?.close();
        // Animate overlay out
        Animated.timing(overlayAnimatedValue, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }).start();
      }
    }, [isVisible, overlayOpacity, animationDuration]);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          // Dismiss keyboard when bottom sheet closes
          Keyboard.dismiss();

          // Animate overlay out when sheet closes
          Animated.timing(overlayAnimatedValue, {
            toValue: 0,
            duration: animationDuration,
            useNativeDriver: true,
          }).start();
          onClose();
        } else {
          // Animate overlay in when sheet opens
          Animated.timing(overlayAnimatedValue, {
            toValue: overlayOpacity,
            duration: animationDuration,
            useNativeDriver: true,
          }).start();
        }
      },
      [onClose, overlayOpacity, animationDuration]
    );

    const handleOverlayPress = useCallback(() => {
      if (enablePanDownToClose) {
        bottomSheetRef.current?.close();
      }
    }, [enablePanDownToClose]);

    const defaultBackgroundStyle = useMemo(
      () => [
        styles.bottomSheetBackground,
        { backgroundColor: colors.background },
        backgroundStyle,
      ],
      [colors.background, backgroundStyle]
    );

    const defaultHandleIndicatorStyle = useMemo(
      () => [
        styles.handleIndicator,
        { backgroundColor: colors.indicator_gray },
        handleIndicatorStyle,
      ],
      [colors.gray_regular, handleIndicatorStyle]
    );

    return (
      <>
        {/* Animated Overlay - behind bottom sheet */}
        {isVisible && (
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayAnimatedValue,
              },
            ]}
          >
            <Pressable
              style={styles.overlayPressable}
              onPress={handleOverlayPress}
            />
          </Animated.View>
        )}

        {/* Bottom Sheet - appears above overlay */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1} // Start closed
          snapPoints={memoizedSnapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={enablePanDownToClose}
          enableDynamicSizing={false}
          backgroundStyle={defaultBackgroundStyle}
          handleIndicatorStyle={defaultHandleIndicatorStyle}
        >
          <BottomSheetView style={styles.contentContainer}>
            {children}
          </BottomSheetView>
        </BottomSheet>
      </>
    );
  }
);

CustomBottomSheet.displayName = "CustomBottomSheet";

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 0, // Behind bottom sheet
  },
  overlayPressable: {
    flex: 1,
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
  },
});
