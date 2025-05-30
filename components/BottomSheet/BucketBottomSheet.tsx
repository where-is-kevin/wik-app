// BucketBottomSheet.tsx
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import CustomText from "@/components/CustomText";
import CustomView from "@/components/CustomView";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { CustomBottomSheet } from "./CustomBottomSheet";

// Define the BucketItem interface directly in this file
export interface BucketItem {
  id: string;
  title: string;
  date: string;
  image: string;
}

interface BucketBottomSheetProps {
  isVisible: boolean;
  bucketItems: BucketItem[];
  onClose: () => void;
  onItemSelect: (item: BucketItem) => void;
  onCreateNew: () => void;
}

export const BucketBottomSheet: React.FC<BucketBottomSheetProps> = ({
  isVisible,
  bucketItems,
  onClose,
  onItemSelect,
  onCreateNew,
}) => {
  const { colors } = useTheme();

  const renderBucketItem = (item: BucketItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.bucketItem}
      onPress={() => {
        onItemSelect(item);
      }}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.bucketItemImage} />
      <CustomView style={styles.bucketItemContent}>
        <CustomText
          style={[
            styles.bucketItemTitle,
            { color: colors.label_dark, fontFamily: "Inter-Medium" },
          ]}
        >
          {item.title}
        </CustomText>
        <CustomText
          style={[
            styles.bucketItemDate,
            { color: colors.gray_regular, fontFamily: "Inter-Regular" },
          ]}
        >
          {item.date}
        </CustomText>
      </CustomView>
    </TouchableOpacity>
  );

  return (
    <CustomBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={["70%"]}
      enablePanDownToClose={true}
    >
      <CustomView style={styles.container}>
        <CustomView style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.label_dark} />
          </TouchableOpacity>
          <CustomText
            style={[
              styles.title,
              { color: colors.label_dark, fontFamily: "Inter-SemiBold" },
            ]}
          >
            Add to bucket
          </CustomText>
          <View style={styles.headerSpacer} />
        </CustomView>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {bucketItems.map(renderBucketItem)}

          <TouchableOpacity
            style={styles.createNewButton}
            onPress={() => {
              onCreateNew();
            }}
            activeOpacity={0.7}
          >
            <CustomView style={styles.createNewIconContainer}>
              <Ionicons name="add" size={24} color="white" />
            </CustomView>
            <CustomText
              style={[
                styles.createNewText,
                { color: colors.label_dark, fontFamily: "Inter-Medium" },
              ]}
            >
              Create new bucket
            </CustomText>
          </TouchableOpacity>
        </ScrollView>
      </CustomView>
    </CustomBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: verticalScale(16),
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
  headerSpacer: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
  },
  bucketItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(8),
  },
  bucketItemImage: {
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: 8,
    marginRight: horizontalScale(16),
  },
  bucketItemContent: {
    flex: 1,
  },
  bucketItemTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    marginBottom: verticalScale(4),
  },
  bucketItemDate: {
    fontSize: scaleFontSize(14),
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    marginTop: verticalScale(8),
  },
  createNewIconContainer: {
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: horizontalScale(16),
  },
  createNewText: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
  },
});
