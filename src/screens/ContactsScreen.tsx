import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';

const contacts = [
  { id: '1', name: 'Scolarité', phone: '+225012345678' },
  { id: '2', name: 'Sécurité', phone: '+225065432100' },
];

export default function ContactsScreen() {
  const call = async (phone: string) => {
    const url = `tel:${phone}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Alert.alert('Impossible', 'Appel non supporté');
  };

  const sms = async (phone: string) => {
    const url = `sms:${phone}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url);
    else Alert.alert('Impossible', 'SMS non supporté');
  };

  return (
    <FlatList
      data={contacts}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1 }}>
          <Text style={{ fontWeight: '600' }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => call(item.phone)}><Text>Appeler</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => sms(item.phone)}><Text>SMS</Text></TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}