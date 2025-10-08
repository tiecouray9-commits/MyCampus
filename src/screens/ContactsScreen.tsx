import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Linking, 
  Alert, 
  StyleSheet,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const contacts = [
  { 
    id: '1', 
    name: 'Scolarité', 
    phone: '+2250507265810',
    icon: 'school-outline',
    color: '#4CAF50'
  },
  { 
    id: '2', 
    name: 'Sécurité', 
    phone: '+2250706744270',
    icon: 'shield-checkmark-outline',
    color: '#FF6B6B'
  },
];

export default function ContactsScreen() {
  const call = async (phone: string) => {
    const url = `tel:${phone}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) {
      Linking.openURL(url);
    } else {
      Alert.alert('Impossible', 'Appel non supporté sur cet appareil');
    }
  };

  const sms = async (phone: string) => {
    const url = `sms:${phone}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) {
      Linking.openURL(url);
    } else {
      Alert.alert('Impossible', 'SMS non supporté sur cet appareil');
    }
  };

  const renderContactItem = ({ item }) => (
    <View style={styles.contactCard}>
      {/* En-tête du contact */}
      <View style={styles.contactHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="white" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.phoneNumber}>{item.phone}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]} 
          onPress={() => call(item.phone)}
        >
          <Ionicons name="call-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Appeler</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.smsButton]} 
          onPress={() => sms(item.phone)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête de la page */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts d'urgence</Text>
        <Text style={styles.headerSubtitle}>
          Contactez rapidement les services disponibles
        </Text>
      </View>

      {/* Liste des contacts */}
      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  listContainer: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  smsButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});