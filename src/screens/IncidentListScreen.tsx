import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
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
      {/* En-tête de la carte */}
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={16} color="#7F8C8D" />
          <Text style={styles.date}>
            {new Date(item.date).toLocaleString('fr-FR')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteIncident(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.cardContent}>
        {/* Média */}
        <View style={styles.mediaContainer}>
          {item.mediaUri.endsWith(".mp4") ? (
            <View style={styles.videoContainer}>
              <Ionicons name="videocam" size={32} color="#4CAF50" />
              <Text style={styles.videoText}>Vidéo</Text>
            </View>
          ) : (
            <Image source={{ uri: item.mediaUri }} style={styles.image} />
          )}
        </View>

        {/* Informations */}
        <View style={styles.infoContainer}>
          <Text style={styles.description}>
            {item.description || "Aucune description"}
          </Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#4CAF50" />
            <Text style={styles.coordinates}>
              {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
            </Text>
          </View>

          <View style={styles.idContainer}>
            <Text style={styles.idText}>ID: #{item.id}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {incidents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>Aucun incident</Text>
          <Text style={styles.emptyText}>
            Les incidents que vous signalez apparaîtront ici
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Incidents enregistrés</Text>
            <Text style={styles.subtitle}>
              {incidents.length} incident{incidents.length > 1 ? 's' : ''} au total
            </Text>
          </View>
          
          <FlatList
            data={incidents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

export default IncidentListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  cardContent: {
    flexDirection: "row",
    gap: 12,
  },
  mediaContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  videoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  videoText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  infoContainer: {
    flex: 1,
    gap: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  coordinates: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  idContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#ECF0F1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idText: {
    fontSize: 10,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 20,
  },
});