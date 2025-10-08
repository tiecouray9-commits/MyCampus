import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // ou une autre librairie d'icônes
import NewsStack from './NewsStack';
import ContactsScreen from '../screens/ContactsScreen';
import MapScreen from '../screens/MapScreen';
import IncidentStack from './IncidentStack';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#007AFF', // Couleur quand l'onglet est actif
        tabBarInactiveTintColor: 'gray', // Couleur quand l'onglet est inactif
      }}
    >
      <Tab.Screen 
        name="Actualités" 
        component={NewsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Carte" 
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Déclarer" 
        component={IncidentStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}