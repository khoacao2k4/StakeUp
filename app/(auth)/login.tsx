import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Feather name="chevron-left" size={24} color="#064E3B" />
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Let's see what bets are waiting for you.</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#047857" style={styles.icon} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#047857"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#047857" style={styles.icon} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#047857"
            />
          </View>

          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator size="large" color="#10B981" />
            ) : (
              <>
                <TouchableOpacity onPress={signInWithEmail} style={styles.button} activeOpacity={0.5}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <Pressable onPress={() => router.push('/(auth)/signup')}>
                    <Text style={styles.linkText}>
                        Don't have an account? <Text style={styles.link}>Sign Up</Text>
                    </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4', // Very light, minty green background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#064E3B',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#059669",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  linkText: {
    color: '#059669',
    textAlign: 'center',
    fontSize: 14,
  },
  link: {
    color: '#10B981',
    fontWeight: 'bold',
  },
});
