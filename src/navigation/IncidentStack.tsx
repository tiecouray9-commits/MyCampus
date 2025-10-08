import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import IncidentScreen from "../screens/IncidentScreen";
import IncidentListScreen from "../screens/IncidentListScreen";

const Stack = createNativeStackNavigator();

export default function IncidentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { 
          backgroundColor: "#4CAF50",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerShadowVisible: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Signaler un incident"
        component={IncidentScreen}
        options={{
          title: "Signaler un incident",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="warning" size={22} color="#FFFFFF" />
              <Text style={styles.headerTitle}>Signaler un incident</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="Incidents enregistrés"
        component={IncidentListScreen}
        options={{
          title: "Incidents enregistrés",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="list" size={22} color="#FFFFFF" />
              <Text style={styles.headerTitle}>Incidents enregistrés</Text>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});