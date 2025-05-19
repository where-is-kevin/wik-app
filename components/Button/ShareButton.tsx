import React from "react";
import { TouchableOpacity, Share, Platform, Alert } from "react-native";
import MoreSvg from "../SvgComponents/MoreSvg";

interface ShareButtonProps {
  title?: string;
  message?: string;
  url?: string;
  onMorePress?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title = "Check this out!",
  message = "I thought you might like this",
  url = "",
  onMorePress,
}) => {
  const handleShare = async () => {
    try {
      if (onMorePress) {
        // If custom handler is provided, use it instead
        onMorePress();
        return;
      }

      const result = await Share.share(
        {
          title: title,
          message: Platform.OS === "ios" ? message : message + " " + url,
          url: Platform.OS === "ios" ? url : "",
        },
        {
          // On iOS, this shows the native share sheet directly
          // On Android, it gives more options
          dialogTitle: "Share this content",
          subject: title,
        }
      );

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log("Shared with activity type:", result.activityType);
        } else {
          // Shared
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log("Share dismissed");
      }
    } catch (error) {
      Alert.alert("Error sharing", error.message);
    }
  };

  return (
    <TouchableOpacity onPress={handleShare}>
      <MoreSvg />
    </TouchableOpacity>
  );
};
export default ShareButton;
