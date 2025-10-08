import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import NewsStack from "./NewsStack";
import ContactsScreen from "../screens/ContactsScreen";
import MapScreen from "../screens/MapScreen";
import IncidentStack from "./IncidentStack";

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#26348B",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string = "";

          switch (route.name) {
            case "Actualités":
              iconName = focused ? "newspaper" : "newspaper-outline";
              break;
            case "Contacts":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Carte":
              iconName = focused ? "map" : "map-outline";
              break;
            case "Déclarer":
              iconName = focused ? "alert-circle" : "alert-circle-outline";
              break;
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Actualités" component={NewsStack} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
      <Tab.Screen name="Déclarer" component={IncidentStack} />
    </Tab.Navigator>
  );
}
