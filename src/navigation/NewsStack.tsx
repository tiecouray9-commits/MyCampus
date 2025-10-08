import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewsScreen from '../screens/NewsScreen';
import NewsDetail from '../screens/NewsDetail';



const Stack = createNativeStackNavigator();


export default function NewsStack() {
return (
<Stack.Navigator>
<Stack.Screen name="NewsList" component={NewsScreen} options={{ title: 'Actualités' }} />
<Stack.Screen name="NewsDetail" component={NewsDetail} options={{ title: 'Détails' }} />
</Stack.Navigator>
);
}