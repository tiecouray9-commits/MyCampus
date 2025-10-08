import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as SQLite from "expo-sqlite";

interface Incident {
  id: number;
  mediaUri: string;
  latitude: number;
  longitude: number;
  description: string;
  date: string;
}

const IncidentListScreen = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // 🔹 Initialiser la base de données
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("incidents.db");
        setDb(database);
      } catch (error) {
        console.error("Erreur d'initialisation de la base de données :", error);
        Alert.alert("Erreur", "Impossible d'initialiser la base de données.");
      }
    };

    initDatabase();
  }, []);

  // 🔹 Charger les incidents quand la base de données est prête
  useEffect(() => {
    if (db) {
      fetchIncidents();
    }
  }, [db]);

  const fetchIncidents = async () => {
    if (!db) return;

    try {
      const result = await db.getAllAsync<Incident>("SELECT * FROM incidents ORDER BY id DESC");
      setIncidents(result);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
      Alert.alert("Erreur", "Impossible de charger les incidents.");
    }
  };

  // 🔹 Supprimer un incident
  const deleteIncident = (id: number) => {
    Alert.alert("Confirmation", "Voulez-vous vraiment supprimer cet incident ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          if (!db) return;

          try {
            await db.runAsync("DELETE FROM incidents WHERE id = ?", [id]);
            await fetchIncidents();
          } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            Alert.alert("Erreur", "Impossible de supprimer l'incident.");
          }
        },
      },
    ]);
  };

  // 🔹 Afficher un item
  const renderItem = ({ item }: { item: Incident }) => (
    <View style={styles.card}>
      {item.mediaUri.endsWith(".mp4") ? (
        <Text style={styles.videoText}>🎥 Vidéo</Text>
      ) : (
        <Image source={{ uri: item.mediaUri }} style={styles.image} />
      )}

      <View style={styles.info}>
        <Text style={styles.desc}>{item.description || "Aucune description"}</Text>
        <Text style={styles.coords}>
          📍 {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
        </Text>
        <Text style={styles.date}>🕒 {new Date(item.date).toLocaleString()}</Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteIncident(item.id)}
        >
          <Text style={styles.deleteText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incidents enregistrés</Text>

      {incidents.length === 0 ? (
        <Text style={styles.emptyText}>Aucun incident enregistré.</Text>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default IncidentListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#F7F8FA",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
  },
  videoText: {
    width: 100,
    height: 100,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#ddd",
  },
  info: {
    flex: 1,
    padding: 10,
  },
  desc: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  coords: {
    color: "#555",
    fontSize: 13,
  },
  date: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#E53935",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },
});