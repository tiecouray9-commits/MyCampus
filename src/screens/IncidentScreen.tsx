import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Type pour toutes les routes de votre navigation
// ⚠️ Le nom doit correspondre EXACTEMENT à celui défini dans votre Stack.Navigator
type RootStackParamList = {
  "Incidents enregistrés": undefined;
  NewsDetail: { id: number };
  // Ajoutez les autres écrans si nécessaire
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Incidents enregistrés">;

const IncidentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [description, setDescription] = useState("");
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // 🔹 Initialisation de la base de données
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("incidents.db");
        setDb(database);

        // Création de la table incidents si non existante
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mediaUri TEXT,
            latitude REAL,
            longitude REAL,
            description TEXT,
            date TEXT
          );
        `);
      } catch (error) {
        console.error("Erreur d'initialisation de la base de données :", error);
        Alert.alert("Erreur", "Impossible d'initialiser la base de données.");
      }
    };

    initDatabase();
  }, []);

  // 🔹 Fonction pour récupérer la position
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Impossible d'accéder à la localisation.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  // 🔹 Fonction pour choisir un média (photo ou vidéo)
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  // 🔹 Enregistrement local dans SQLite
  const saveIncident = async () => {
    if (!mediaUri || !location) {
      Alert.alert("Erreur", "Veuillez ajouter un média et activer la localisation.");
      return;
    }

    if (!db) {
      Alert.alert("Erreur", "Base de données non initialisée.");
      return;
    }

    const date = new Date().toISOString();

    try {
      await db.runAsync(
        "INSERT INTO incidents (mediaUri, latitude, longitude, description, date) VALUES (?, ?, ?, ?, ?)",
        [mediaUri, location.latitude, location.longitude, description, date]
      );

      Alert.alert("Succès", "Incident enregistré localement !");
      setMediaUri(null);
      setDescription("");
      setLocation(null);
    } catch (error) {
      console.error("Erreur SQLite :", error);
      Alert.alert("Erreur", "Échec de l'enregistrement local.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signaler un Incident</Text>

      <TouchableOpacity style={styles.button} onPress={pickMedia}>
        <Text style={styles.buttonText}>Choisir un média</Text>
      </TouchableOpacity>

      {mediaUri && (
        <View style={styles.previewContainer}>
          {mediaUri.endsWith(".mp4") || mediaUri.includes("video") ? (
            <Text style={styles.previewText}>🎥 Vidéo sélectionnée</Text>
          ) : (
            <Image source={{ uri: mediaUri }} style={styles.previewImage} />
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={getLocation}>
        <Text style={styles.buttonText}>Obtenir la position</Text>
      </TouchableOpacity>

      {location && (
        <Text style={styles.coordText}>
          Latitude: {location.latitude.toFixed(6)} | Longitude: {location.longitude.toFixed(6)}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Description de l'incident (optionnelle)"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: "#4CAF50" }]} onPress={saveIncident}>
        <Text style={styles.buttonText}>Enregistrer l'incident</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigation.navigate("Incidents enregistrés")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Voir les incidents enregistrés</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IncidentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#26348B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  previewContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  previewText: {
    fontSize: 16,
    color: "#444",
  },
  coordText: {
    textAlign: "center",
    marginVertical: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
});