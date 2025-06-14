import { Tabs } from 'expo-router';
import TabBar from '../../components/TabBar'; // Import your custom TabBar

export default function AppLayout() {
  return (
    <Tabs
      // Pass our custom TabBar component to the tabBar prop
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home"
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create"
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile"
        }}
      />
    </Tabs>
  );
}