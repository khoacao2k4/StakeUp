import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { Ionicons, Feather } from "@expo/vector-icons";

// Define the icons for each route
const icons: any = {
  home: (props: any) => (
    <Ionicons
      name={props.isFocused ? "home" : "home-outline"}
      size={26}
      {...props}
    />
  ),
  create: (props: any) => <Feather name="plus" size={26} {...props} />,
  profile: (props: any) => (
    <Ionicons
      name={props.isFocused ? "person" : "person-outline"}
      size={26}
      {...props}
    />
  ),
};

const TabBarButton = (props: any) => {
  const { isFocused, label, routeName, color } = props;

  // Special styling for the 'Create' button
  if (routeName === "create") {
    return (
      <Pressable {...props} style={styles.createButtonContainer}>
        <View style={styles.createButton}>
          {icons[routeName]({ color: "white" })}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable {...props} style={styles.container}>
      {/* The icon is now in a standard View */}
      <View>
        {icons[routeName]({ color, isFocused })}
      </View>

      <Text style={[{ color, fontSize: 11 }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  createButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#10B981",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30, // Elevate the button
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default TabBarButton;
