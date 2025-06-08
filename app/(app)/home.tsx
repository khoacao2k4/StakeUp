import { getAuth } from "firebase/auth";
import { Button, Text, View } from "react-native";

export default function Home(){
    const user = getAuth().currentUser;
    return (
        <View>
            <Text>Welcome back, {user?.email}</Text>
            <Button title="Logout" onPress={() => {getAuth().signOut()}} />
        </View>
    )
}