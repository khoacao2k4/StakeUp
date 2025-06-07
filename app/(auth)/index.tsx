import ImageViewer from '@/components/ImageViewer';
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const placeHolderImage = require('../../assets/images/onboard_img.gif');

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Text style={styles.title}>
          💰 Betmate 💰
        </Text>
      </View>
      <View style={styles.imageWrapper}>
        <ImageViewer imgSource={placeHolderImage} />
      </View>
      <View style={styles.buttonWrapper}>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(auth)/login" asChild>
          <Text style={styles.loginText}>Already have an account?</Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100, // Pushes content down, not flush to top
    paddingBottom: 60, // Keeps buttons off the very bottom
    paddingHorizontal: 24,
  },
  headerWrapper: {
    marginBottom: 16,
    flex: 1,
    justifyContent: 'center',
    //backgroundColor: "#FFFF00"
  },
  imageWrapper: {
    marginBottom: 24,
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: "#FF0000"
  },
  buttonWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#2ecc71',
  },
  button: {
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginText: {
    color: '#2ecc71',
    fontSize: 15,
  },
})
