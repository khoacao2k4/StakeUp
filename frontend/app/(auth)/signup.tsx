import { Feather } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // State to hold validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Validation Logic
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    setErrors(newErrors);
    // Return true if there are no errors
    return Object.keys(newErrors).length === 0;
  };


  const signUpWithEmail = async () => {
    Keyboard.dismiss();
    // Validate the form before trying to sign up
    if (validateForm()) {
      setLoading(true);
      const { data: { session }, error, } = await supabase.auth.signUp({ email: email, password: password, })
      if (error) Alert.alert(error.message)
      if (!session) Alert.alert('Please check your inbox for email verification!')
      setLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={26} color="#064E3B" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the fun and start making friendly wagers.</Text>

          {/* Email Input */}
          <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
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
          {/* Display Email Error Message */}
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password Input */}
          <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
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
          {/* Display Password Error Message */}
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator size="large" color="#10B981" />
            ) : (
              <>
                <TouchableOpacity onPress={signUpWithEmail} style={styles.button} activeOpacity={0.5}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <Pressable onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.loginText}>
                    Already have an account? <Text style={styles.loginLink}>Login</Text>
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
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
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginBottom: 16, // Reduced margin to make space for error text
  },
  inputError: {
    borderColor: '#EF4444', // Red border for error
    backgroundColor: '#FEF2F2',
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
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 10,
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
  loginText: {
    color: '#059669',
    textAlign: 'center',
    fontSize: 14,
  },
  loginLink: {
    color: '#10B981',
    fontWeight: 'bold',
  },
});
