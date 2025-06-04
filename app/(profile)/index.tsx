import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackHeader from "@/components/Header/BackHeader";
import NavigationHeader from "@/components/Header/NavigationHeader";
import { useTheme } from "@/contexts/ThemeContext";
import CustomView from "@/components/CustomView";
import CustomTextInput from "@/components/TextInput/CustomTextInput";
import { horizontalScale, verticalScale } from "@/utilities/scaling";
import NextButton from "@/components/Button/NextButton";
import CustomTouchable from "@/components/CustomTouchableOpacity";
import EditProfileSvg from "@/components/SvgComponents/EditProfileSvg";

const UpdateProfile = () => {
  const { colors } = useTheme();
  const { data: user } = useUser();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const router = useRouter();

  const [form, setForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    home: "",
    profileImageUrl: "",
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (user) {
      setForm({
        id: user.id || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        location: user.location || "",
        home: user.home || "",
        profileImageUrl: user.profileImageUrl || "",
        createdAt: user.createdAt || new Date().toISOString(),
      });
    }
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // add the id to the form data
    updateUser(form, {
      onSuccess: () => {
        console.log("User updated successfully");
        router.back();
      },
      onError: (err: any) => {
        console.error("Error updating user:", err);
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <NavigationHeader header="Edit profile" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <CustomView style={styles.inputContainer}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    user?.profileImageUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&auto=format",
                }}
                style={styles.profileImage}
              />
              <CustomTouchable
                bgColor={colors.overlay}
                style={styles.cameraContainer}
              >
                <EditProfileSvg />
              </CustomTouchable>
            </View>
            <CustomTextInput
              label="First name"
              placeholder="First name"
              value={form.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
            />

            <CustomTextInput
              label="Last name"
              placeholder="Last name"
              value={form.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
            />
            <CustomTextInput
              label="Email"
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => handleChange("email", text)}
            />

            <CustomTextInput
              label="Home"
              placeholder="Home"
              value={form.home}
              onChangeText={(text) => handleChange("home", text)}
            />
            <CustomTextInput
              label="Travel destination"
              placeholder="Travel destination"
              value={form.location}
              onChangeText={(text) => handleChange("location", text)}
            />
          </CustomView>
          <NextButton
            onPress={handleSubmit}
            bgColor={colors.lime}
            customStyles={{ marginHorizontal: horizontalScale(24) }}
            title={isPending ? "Updating..." : "Update"}
            disabled={isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: verticalScale(10),
  },
  inputContainer: {
    flex: 1,
    gap: verticalScale(12),
    paddingTop: verticalScale(6),
    paddingHorizontal: horizontalScale(24),
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 360,
    marginBottom: verticalScale(12),
    alignSelf: "center",
  },
  avatarContainer: {
    position: "relative", // This is important to position the camera icon inside the avatar
  },
  cameraContainer: {
    position: "absolute",
    bottom: -4,
    right: "32%",
    padding: 10,
    borderRadius: 1000,
    zIndex: 10,
  },
});

export default UpdateProfile;
