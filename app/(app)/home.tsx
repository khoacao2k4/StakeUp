import { Alert, Button, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";
export default function Home(){
    const doLogout = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error Signing Out User", error.message);
    }
  }
    return (
        <View>
            <Text>Welcome back</Text>
            <Button title="Logout" onPress={doLogout} />
        </View>
    )
}