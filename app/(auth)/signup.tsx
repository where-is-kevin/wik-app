import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreateUser } from '@/hooks/useUser';

export default function Signup() {
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('All fields are required');
      return;
    }
    console.log('Creating user:', form);
    createUser(form, {
      onSuccess: () => {
        Alert.alert('Signup successful!', 'Please log in.');
        router.replace('/(onboarding)');
      },
      onError: (err: any) => {
        Alert.alert('Signup failed', err?.message || 'Unknown error');
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={form.username}
        onChangeText={(text) => handleChange('username', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      <Button title={isPending ? 'Signing up...' : 'Sign Up'} onPress={handleSubmit} disabled={isPending} />
      <Text style={styles.loginText} onPress={() => router.replace('/')}>
        Already have an account? Log in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  loginText: { marginTop: 16, color: '#007bff', textAlign: 'center' },
});