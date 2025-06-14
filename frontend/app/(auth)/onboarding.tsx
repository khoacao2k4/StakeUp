import ImageViewer from '@/components/ImageViewer'; // Assuming this component exists
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const placeHolderImage = require('../../assets/images/onboard_img.gif');

export default function Onboarding() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* header */}
        <View style={styles.header}>
          <Feather name="dollar-sign" size={40} color="#10B981" />
          <Text style={styles.title}>Betmate</Text>
          <Text style={styles.subtitle}>Friendly Wagers, Real Fun.</Text>
        </View>

        {/* middle image */}
        <View style={styles.imageWrapper}>
          <ImageViewer imgSource={placeHolderImage} />
        </View>

        {/* signup/login */}
        <View style={styles.footer}>
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.5}>
              <Text style={styles.primaryButtonText}>Create an Account</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.5}>
              <Text style={styles.secondaryButtonText}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4', // Use the same light minty green background
  },
  content: {
    flex: 1,
    justifyContent: 'space-between', // Distributes content evenly
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#064E3B', // Dark, rich green for the main title
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#059669', // Softer, secondary green for the tagline
    marginTop: 4,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1, // Ensures the image container is square
    alignItems: 'center',
    justifyContent: 'center',
    // You might want to style your ImageViewer component directly
  },
  footer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#10B981', // A vibrant, primary green for the main action
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    // Matching shadow style from the signup screen
    shadowColor: "#059669",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981', // Border color matches the primary button
  },
  secondaryButtonText: {
    color: '#10B981', // Text color matches the primary button
    fontWeight: '600',
    fontSize: 18,
  },
})
