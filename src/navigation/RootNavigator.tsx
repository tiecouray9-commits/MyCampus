import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NewsStack from './NewsStack';
import ContactsScreen from '../screens/ContactsScreen';
import MapScreen from '../screens/MapScreen';
import IncidentStack from './IncidentStack';



const Tab = createBottomTabNavigator();


export default function RootNavigator() {
return (
<Tab.Navigator screenOptions={{ headerShown: false }}>
<Tab.Screen name="Actualités" component={NewsStack} />
<Tab.Screen name="Contacts" component={ContactsScreen} />
<Tab.Screen name="Carte" component={MapScreen} />
<Tab.Screen name="Déclarer" component={IncidentStack} />
</Tab.Navigator>
);
}