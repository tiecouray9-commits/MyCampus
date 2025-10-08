import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IncidentScreen from "../screens/IncidentScreen";
import IncidentListScreen from "../screens/IncidentListScreen";

const Stack = createNativeStackNavigator();

export default function IncidentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Signaler un incident"
        component={IncidentScreen}
        options={{
          title: "Signaler un incident",
          headerStyle: { backgroundColor: "#26348B" },
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="Incidents enregistrés"
        component={IncidentListScreen}
        options={{
          title: "Incidents enregistrés",
          headerStyle: { backgroundColor: "#26348B" },
          headerTintColor: "#fff",
        }}
      />
    </Stack.Navigator>
  );
}
