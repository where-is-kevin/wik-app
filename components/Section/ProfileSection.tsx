import { useTheme } from "@/contexts/ThemeContext";
import {
  horizontalScale,
  scaleFontSize,
  verticalScale,
} from "@/utilities/scaling";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../CustomText";
import CustomTouchable from "../CustomTouchableOpacity";
import CustomView from "../CustomView";
import EditSvg from "../SvgComponents/EditSvg";
import HomeSvg from "../SvgComponents/HomeSvg";
import LocationSvg from "../SvgComponents/LocationSvg";
import OptimizedImage from "../OptimizedImage/OptimizedImage";

type ProfileSectionProps = {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    personalSummary?: string;
    location?: string;
    home?: string;
  };
};

const ProfileSection = ({ user }: ProfileSectionProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  
  // Default fallback image for profile
  const DEFAULT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&auto=format";

  const onEditPress = () => {
    router.push("/(profile)");
  };

  // Helper function to get valid image URL
  const getValidImageUrl = (imageUrl?: string): string | null => {
    if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      return imageUrl;
    }
    return null;
  };

  // Get safe profile image source
  const validProfileImageUrl = getValidImageUrl(user?.profileImageUrl) || DEFAULT_PROFILE_IMAGE;

  console.log(user);

  return (
    <CustomView
      bgColor={colors.onboarding_gray}
      style={[
        styles.profileHeader,
        { paddingTop: insets.top + verticalScale(12) },
      ]}
    >
      {/* Profile Image */}
      <OptimizedImage
        source={{ uri: validProfileImageUrl }}
        style={styles.profileImage}
        resizeMode="cover"
        priority="high"
        showLoader={false} // Avatar usually doesn't need loader as it's small
        fallbackSource={DEFAULT_PROFILE_IMAGE}
      />

      {/* Name and Edit Icon */}
      <CustomView bgColor={colors.onboarding_gray} style={styles.nameContainer}>
        <CustomText
          fontFamily="Inter-Bold"
          style={[styles.profileName, { color: colors.profile_name_black }]}
        >
          {user?.firstName || "Placeholder Name"}
        </CustomText>
        <CustomTouchable onPress={onEditPress} bgColor={colors.onboarding_gray}>
          <EditSvg />
        </CustomTouchable>
      </CustomView>
      {user?.personalSummary && (
        <CustomText
          style={[styles.profileBio, { color: colors.profile_name_black }]}
        >
          {user?.personalSummary || ""}
        </CustomText>
      )}

      {/* Location Tags */}
      <CustomView
        bgColor={colors.onboarding_gray}
        style={[
          styles.locationContainer,
          !user?.personalSummary && { marginTop: verticalScale(10) },
        ]}
      >
        <CustomView
          bgColor={colors.profile_name_black}
          style={styles.locationTag}
        >
          <LocationSvg />
          <CustomText
            fontFamily="Inter-Medium"
            style={[styles.locationText, { color: colors.text_white }]}
          >
            {user?.location || "No location"}
          </CustomText>
        </CustomView>

        <CustomView
          bgColor={colors.opacity_lime}
          style={styles.secondaryLocationTag}
        >
          <HomeSvg />
          <CustomText
            fontFamily="Inter-Medium"
            style={[styles.locationText, { color: colors.profile_name_black }]}
          >
            {user?.home || "No location"}
          </CustomText>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default ProfileSection;

const styles = StyleSheet.create({
  profileHeader: {
    paddingHorizontal: horizontalScale(24),
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: verticalScale(24),
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Half of width/height for perfect circle
    marginBottom: verticalScale(12),
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  profileName: {
    fontSize: scaleFontSize(22),
    marginRight: horizontalScale(10),
    textTransform: "capitalize",
  },
  profileBio: {
    textAlign: "center",
    fontSize: scaleFontSize(14),
    marginBottom: verticalScale(12),
  },
  locationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 44,
    marginRight: horizontalScale(6),
  },
  locationText: {
    marginLeft: horizontalScale(6),
    fontSize: scaleFontSize(12),
  },
  secondaryLocationTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 44,
  },
});