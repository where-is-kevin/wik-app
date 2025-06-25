import React, { useState } from "react";
import { TouchableOpacity, Share, Platform, Alert } from "react-native";
import MoreSvg from "../SvgComponents/MoreSvg";

interface ShareButtonProps {
  title?: string;
  message?: string;
  url?: string;
  onMorePress?: () => void;
  width?: number;
  height?: number;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title = "Check this out!",
  message = "I thought you might like this",
  url = "",
  width,
  height,
  onMorePress,
}) => {
  const [isSharing, setIsSharing] = useState(false);

  const isValidUrl = (urlString: string): boolean => {
    if (!urlString.trim()) return false;
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    try {
      if (onMorePress) {
        // If custom handler is provided, use it instead
        onMorePress();
        return;
      }

      setIsSharing(true);

      // Validate URL if provided
      const validUrl = url && isValidUrl(url) ? url : "";

      const shareContent = {
        title: title,
        message:
          Platform.OS === "ios"
            ? message
            : `${message}${validUrl ? ` ${validUrl}` : ""}`,
        ...(Platform.OS === "ios" && validUrl && { url: validUrl }),
      };

      const result = await Share.share(shareContent, {
        // On iOS, this shows the native share sheet directly
        // On Android, it gives more options
        dialogTitle: "Share this content",
        subject: title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          // console.log("Shared with activity type:", result.activityType);
        } else {
          // Shared
          // console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        // console.log("Share dismissed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while sharing";
      Alert.alert("Error sharing", errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleShare}
      disabled={isSharing}
      accessible={true}
      accessibilityLabel="Share content"
      accessibilityRole="button"
      accessibilityHint="Opens sharing options for this content"
      style={{ opacity: isSharing ? 0.6 : 1 }}
    >
      <MoreSvg width={width} height={height} />
    </TouchableOpacity>
  );
};

export default ShareButton;
