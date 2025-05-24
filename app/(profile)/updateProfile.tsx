import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from "react-native";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { create } from "react-test-renderer";

const UpdateProfile = () => {
  const { data: user } = useUser();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const router = useRouter();

  const [form, setForm] = useState({
    id: "",
    username: "",
    email: "",
    description: "",
    location: "",
    home: "",
    profileImageUrl: "",
    createdAt: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        id: user.id || "",
        username: user.username || "",
        email: user.email || "",
        description: user.description || "",
        location: user.location || "",
        home: user.home || "",
        profileImageUrl: user.profileImageUrl || "",
        createdAt: user.createdAt || "",
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Update Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={form.username}
        onChangeText={(text) => handleChange("username", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={form.description}
        onChangeText={(text) => handleChange("description", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={form.location}
        onChangeText={(text) => handleChange("location", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Home"
        value={form.home}
        onChangeText={(text) => handleChange("home", text)}
      />
      <Button
        title={isPending ? "Updating..." : "Update"}
        onPress={handleSubmit}
        disabled={isPending}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16 },
});

export default UpdateProfile;