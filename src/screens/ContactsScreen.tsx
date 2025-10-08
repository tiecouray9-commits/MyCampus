import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const contacts = [
  { id: "1", name: "Scolarité", phone: "+225012345678" },
  { id: "2", name: "Sécurité", phone: "+225065432100" },
  { id: "3", name: "Infirmier de d'école", phone: "+225070000111" },
  { id: "4", name: "Direction Pédagogique", phone: "+225050303030" },
];

export default function ContactsScreen() {
  const call = async (phone: string) => {
    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert("Impossible", "Appel non supporté sur cet appareil.");
  };

  const sms = async (phone: string) => {
    const url = `sms:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert("Impossible", "SMS non supporté sur cet appareil.");
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Ionicons name="person-circle-outline" size={36} color="#26348B" />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#22C55E" }]} onPress={() => call(item.phone)}>
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.actionText}>Appeler</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#3B82F6" }]} onPress={() => sms(item.phone)}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          <Text style={styles.actionText}>SMS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📞 Contacts utiles du campus</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E293B",
  },
  phone: {
    color: "#64748B",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
