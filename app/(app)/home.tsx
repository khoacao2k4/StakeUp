import { getAuth } from "firebase/auth"
import { Button, Text, View } from "react-native"

export default function Home(){
    return (
        <View>
            <Text>Home</Text>
            <Button title="Logout" onPress={() => {getAuth().signOut()}} />
        </View>
    )
}