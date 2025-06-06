// EmptyState.tsx
import React from "react";
import { StyleSheet } from "react-native";
import CustomView from "@/components/CustomView";
import CustomText from "@/components/CustomText";
import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";

interface EmptyDataProps {
  type: "buckets" | "likes";
  data?: any[];
  style?: any;
}

const EmptyData: React.FC<EmptyDataProps> = ({ type, data, style }) => {
  const { colors } = useTheme();

  // Check if we should show empty state
  const shouldShowEmpty = React.useMemo(() => {
    if (!data || data.length === 0) return true;

    if (type === "buckets") {
      // For buckets, check if any bucket has content
      return !data.some(
        (bucket: any) =>
          bucket.content &&
          Array.isArray(bucket.content) &&
          bucket.content.length > 0
      );
    }

    // For likes, just check if array is empty
    return data.length === 0;
  }, [data, type]);

  if (!shouldShowEmpty) return null;

  const getEmptyStateContent = () => {
    if (type === "buckets") {
      return {
        title: "Where to first?",
        subtitle: "Add it to your travel bucket so you don't forget",
      };
    }
    return {
      title: "Looks empty in here...",
      subtitle: "Tap ♥ to start saving spots",
    };
  };

  const { title, subtitle } = getEmptyStateContent();

  return (
    <CustomView style={[styles.emptyStateContainer, style]}>
      <CustomText
        style={[styles.emptyStateTitle, { color: colors.gray_regular }]}
        fontFamily="Inter-SemiBold"
      >
        {title}
      </CustomText>
      <CustomText
        style={[styles.emptyStateSubtitle, { color: colors.gray_regular }]}
      >
        {subtitle}
      </CustomText>
    </CustomView>
  );
};

export default EmptyData;

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(32),
    paddingVertical: verticalScale(60),
  },
  emptyStateTitle: {
    fontSize: scaleFontSize(20),
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  emptyStateSubtitle: {
    fontSize: scaleFontSize(16),
    textAlign: "center",
    lineHeight: 24,
  },
});
